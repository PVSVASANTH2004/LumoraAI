import { motion } from 'framer-motion'

export default function PageLoader() {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <motion.div
        className="flex flex-col items-center gap-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="w-12 h-12 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow-primary"
          animate={{ scale: [1, 1.05, 1], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 3H4C3.4 3 3 3.4 3 4V9C3 9.6 3.4 10 4 10H9C9.6 10 10 9.6 10 9V4C10 3.4 9.6 3 9 3Z" fill="white" fillOpacity="0.9"/>
            <path d="M20 3H15C14.4 3 14 3.4 14 4V9C14 9.6 14.4 10 15 10H20C20.6 10 21 9.6 21 9V4C21 3.4 20.6 3 20 3Z" fill="white" fillOpacity="0.6"/>
            <path d="M9 14H4C3.4 14 3 14.4 3 15V20C3 20.6 3.4 21 4 21H9C9.6 21 10 20.6 10 20V15C10 14.4 9.6 14 9 14Z" fill="white" fillOpacity="0.6"/>
            <path d="M20 14H15C14.4 14 14 14.4 14 15V20C14 20.6 14.4 21 15 21H20C20.6 21 21 20.6 21 20V15C21 14.4 20.6 14 20 14Z" fill="white" fillOpacity="0.4"/>
          </svg>
        </motion.div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-lumora-primary"
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  )
}
