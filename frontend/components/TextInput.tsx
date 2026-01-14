export default function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={
        "w-full rounded-xl bg-zinc-950 border border-zinc-800 px-4 py-2 text-sm outline-none " +
        "focus:ring-2 focus:ring-white/15 focus:border-white/20 " +
        (props.className || "")
      }
    />
  );
}
