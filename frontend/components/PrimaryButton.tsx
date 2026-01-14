export default function PrimaryButton({
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={
        "w-full rounded-xl bg-white text-black font-medium py-2.5 text-sm hover:bg-zinc-200 " +
        "disabled:opacity-60 disabled:cursor-not-allowed " +
        (props.className || "")
      }
    >
      {children}
    </button>
  );
}
