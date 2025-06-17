export default function BadgesItem({ children }) {
  return (
    <span
      className="inline-block bg-gray-900 text-white rounded-full py-1.5 px-4 mx-1 text-sm font-medium"
    >
      {children}
    </span>
  );
}