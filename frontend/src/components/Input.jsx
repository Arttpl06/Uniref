export default function Input({ tipo = 'text', className, ...props }) {
  return (
    <input
      type={tipo}
      className={
        className ??
        'bg-white text-dark mb-4  w-100 border border-dark border-2 border-opacity-25 rounded'
      }
      {...props}
    />
  );
}
