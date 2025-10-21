import { readFile } from 'fs/promises';
import { join } from 'path';
import * as yaml from 'js-yaml';
import type { SkillMetadata, ParseResult } from './types.js';

/**
 * MetadataParser - Parses skill metadata from SKILL.yaml and SKILL.md/PROMPT.md files
 */
export class MetadataParser {
  /**
   * Parse SKILL.yaml file
   * @param filePath Path to SKILL.yaml file
   * @returns Parsed metadata or error
   */
  async parseYaml(filePath: string): Promise<ParseResult<SkillMetadata>> {
    try {
      const content = await readFile(filePath, 'utf-8');
      const data = yaml.load(content) as any;

      // Validate required fields
      if (!data.name) {
        return {
          success: false,
          error: 'Missing required field: name',
        };
      }

      if (!data.version) {
        return {
          success: false,
          error: 'Missing required field: version',
        };
      }

      if (!data.description) {
        return {
          success: false,
          error: 'Missing required field: description',
        };
      }

      // Build metadata object
      const metadata: SkillMetadata = {
        name: data.name,
        version: data.version,
        description: data.description,
        author: data.author,
        license: data.license,
        triggers: data.triggers || [],
        dependencies: {
          skills: data.dependencies?.skills || [],
          apis: data.dependencies?.apis || [],
          packages: data.dependencies?.packages || [],
        },
        capabilities: data.capabilities || [],
        config: data.config,
        npmScripts: data.npm_scripts,
        documentation: data.documentation,
        integration: data.integration,
        changelog: data.changelog,
      };

      return {
        success: true,
        data: metadata,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Parse SKILL.md or PROMPT.md file
   * @param filePath Path to markdown file
   * @returns Parsed content or error
   */
  async parseMarkdown(filePath: string): Promise<ParseResult<string>> {
    try {
      const content = await readFile(filePath, 'utf-8');

      return {
        success: true,
        data: content,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Parse complete skill metadata from a skill folder
   * @param skillPath Path to skill folder
   * @returns Complete skill metadata with prompt content
   */
  async parseSkillMetadata(
    skillPath: string
  ): Promise<ParseResult<{ metadata: SkillMetadata; promptContent: string }>> {
    try {
      // Try to find and parse prompt file (SKILL.md or PROMPT.md)
      let promptContent = '';
      let promptFilePath = '';
      const promptFiles = ['SKILL.md', 'PROMPT.md'];

      for (const promptFile of promptFiles) {
        const promptPath = join(skillPath, promptFile);
        const promptResult = await this.parseMarkdown(promptPath);

        if (promptResult.success && promptResult.data) {
          promptContent = promptResult.data;
          promptFilePath = promptPath;
          break;
        }
      }

      if (!promptContent) {
        return {
          success: false,
          error: 'No SKILL.md or PROMPT.md file found',
        };
      }

      // Try to parse SKILL.yaml first (preferred)
      const yamlPath = join(skillPath, 'SKILL.yaml');
      const yamlResult = await this.parseYaml(yamlPath);

      if (yamlResult.success && yamlResult.data) {
        // YAML exists and is valid - use it
        return {
          success: true,
          data: {
            metadata: yamlResult.data,
            promptContent,
          },
        };
      }

      // YAML doesn't exist or is invalid - fallback to markdown metadata
      const mdMetadataResult = await this.parseMarkdownMetadata(promptFilePath);

      if (!mdMetadataResult.success || !mdMetadataResult.data) {
        return {
          success: false,
          error: `Failed to parse metadata from markdown: ${mdMetadataResult.error}`,
        };
      }

      // Convert partial metadata to full metadata with defaults
      const metadata: SkillMetadata = {
        name: mdMetadataResult.data.name!,
        version: mdMetadataResult.data.version || '1.0.0',
        description: mdMetadataResult.data.description || 'No description',
        author: mdMetadataResult.data.author,
        license: mdMetadataResult.data.license,
        triggers: mdMetadataResult.data.triggers || [],
        dependencies: mdMetadataResult.data.dependencies || {
          skills: [],
          apis: [],
          packages: [],
        },
        capabilities: mdMetadataResult.data.capabilities || [],
        config: mdMetadataResult.data.config,
        npmScripts: mdMetadataResult.data.npmScripts,
        documentation: mdMetadataResult.data.documentation,
        integration: mdMetadataResult.data.integration,
        changelog: mdMetadataResult.data.changelog,
      };

      return {
        success: true,
        data: {
          metadata,
          promptContent,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Extract frontmatter from markdown content
   * @param content Markdown content
   * @returns Frontmatter object and remaining content
   */
  extractFrontmatter(content: string): {
    frontmatter: Record<string, any>;
    content: string;
  } {
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);

    if (!match) {
      return {
        frontmatter: {},
        content,
      };
    }

    try {
      const frontmatter = yaml.load(match[1]) as Record<string, any>;
      return {
        frontmatter: frontmatter || {},
        content: match[2],
      };
    } catch (error) {
      return {
        frontmatter: {},
        content,
      };
    }
  }

  /**
   * Parse minimal metadata from markdown file only (fallback)
   * @param filePath Path to markdown file
   * @returns Minimal metadata extracted from markdown
   */
  async parseMarkdownMetadata(
    filePath: string
  ): Promise<ParseResult<Partial<SkillMetadata>>> {
    try {
      const content = await readFile(filePath, 'utf-8');
      const { frontmatter } = this.extractFrontmatter(content);

      // Extract title from first heading
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const title = titleMatch ? titleMatch[1] : 'Untitled Skill';

      // Build minimal metadata
      const metadata: Partial<SkillMetadata> = {
        name: frontmatter.name || this.slugify(title),
        version: frontmatter.version || '1.0.0',
        description: frontmatter.description || title,
        triggers: frontmatter.triggers || [],
        dependencies: {
          skills: [],
          apis: [],
          packages: [],
        },
        capabilities: [],
      };

      return {
        success: true,
        data: metadata,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Convert string to slug format
   * @param text Text to slugify
   * @returns Slugified text
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}
