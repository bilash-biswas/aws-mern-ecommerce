interface MessageProps {
  variant?: 'success' | 'error' | 'warning' | 'info';
  children: React.ReactNode;
}

const Message: React.FC<MessageProps> = ({ variant = 'info', children }) => {
  const variants = {
    success: 'bg-emerald-950/30 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.05)]',
    error: 'bg-red-950/30 text-red-400 border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.05)]',
    warning: 'bg-amber-950/30 text-amber-400 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.05)]',
    info: 'bg-indigo-950/30 text-indigo-400 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.05)]',
  };

  return (
    <div className={`p-4 rounded-xl border ${variants[variant]} mb-4 backdrop-blur-md`}>
      {children}
    </div>
  );
};

export default Message;