import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

/**
 * Framer Motion 12 + React 19 호환성 긴급 테스트 컴포넌트
 *
 * 테스트 항목:
 * 1. 기본 애니메이션 (opacity, scale)
 * 2. Layout 애니메이션
 * 3. Exit 애니메이션 (AnimatePresence)
 * 4. Gesture 애니메이션 (hover, tap)
 * 5. Variants 패턴
 */
export function FramerMotionTest() {
  const [isVisible, setIsVisible] = useState(true);
  const [count, setCount] = useState(0);

  return (
    <div className="p-8 space-y-8 bg-noir-charcoal min-h-screen">
      <h1 className="text-2xl font-bold text-detective-gold">
        Framer Motion 12 + React 19 호환성 테스트
      </h1>

      {/* Test 1: 기본 애니메이션 */}
      <section className="space-y-4">
        <h2 className="text-xl text-detective-burnished">Test 1: 기본 애니메이션</h2>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="p-4 bg-noir-ash rounded-lg text-white"
        >
          ✅ Fade In + Slide Up 애니메이션
        </motion.div>
      </section>

      {/* Test 2: Gesture 애니메이션 */}
      <section className="space-y-4">
        <h2 className="text-xl text-detective-burnished">Test 2: Gesture 애니메이션</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-detective-gold text-noir-deepBlack rounded-lg font-semibold"
        >
          Hover & Tap Me
        </motion.button>
      </section>

      {/* Test 3: Layout 애니메이션 */}
      <section className="space-y-4">
        <h2 className="text-xl text-detective-burnished">Test 3: Layout 애니메이션</h2>
        <motion.div
          layout
          className="p-4 bg-noir-ash rounded-lg text-white cursor-pointer"
          onClick={() => setCount(count + 1)}
        >
          Clicks: {count} (클릭하여 Layout 애니메이션 테스트)
        </motion.div>
      </section>

      {/* Test 4: Exit 애니메이션 (AnimatePresence) */}
      <section className="space-y-4">
        <h2 className="text-xl text-detective-burnished">Test 4: Exit 애니메이션</h2>
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="px-4 py-2 bg-detective-burnished text-white rounded"
        >
          Toggle Visibility
        </button>
        <AnimatePresence mode="wait">
          {isVisible && (
            <motion.div
              key="test-box"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="p-4 bg-noir-ash rounded-lg text-white"
            >
              ✅ AnimatePresence 작동 중
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Test 5: Variants 패턴 */}
      <section className="space-y-4">
        <h2 className="text-xl text-detective-burnished">Test 5: Variants 패턴</h2>
        <motion.div
          variants={{
            hidden: { opacity: 0, x: -20 },
            visible: { opacity: 1, x: 0 },
          }}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.5 }}
          className="p-4 bg-noir-ash rounded-lg text-white"
        >
          ✅ Variants 패턴 작동
        </motion.div>
      </section>

      {/* Test 6: Stagger Children (게임에서 사용하는 패턴) */}
      <section className="space-y-4">
        <h2 className="text-xl text-detective-burnished">Test 6: Stagger Children</h2>
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          initial="hidden"
          animate="visible"
          className="space-y-2"
        >
          {[1, 2, 3].map((item) => (
            <motion.div
              key={item}
              variants={{
                hidden: { opacity: 0, x: -20 },
                visible: { opacity: 1, x: 0 },
              }}
              className="p-3 bg-noir-ash rounded text-white"
            >
              Item {item}
            </motion.div>
          ))}
        </motion.div>
      </section>

      <div className="p-4 bg-functional-success/20 border border-functional-success rounded-lg">
        <p className="text-functional-success font-semibold">
          ✅ 모든 테스트가 에러 없이 렌더링되면 React 19 + Framer Motion 12 호환성 확인됨
        </p>
        <p className="text-white mt-2 text-sm">
          • DevTools Console 확인<br />
          • 각 애니메이션이 부드럽게 작동하는지 확인<br />
          • 브라우저 에러 로그 확인
        </p>
      </div>
    </div>
  );
}
