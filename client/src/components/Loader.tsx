const Loader = () => {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-card-border"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-primary-indigo border-r-purple-500 animate-spin"></div>
      </div>
    </div>
  );
};

export default Loader;