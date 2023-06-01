import clsx from "clsx";

const Avatar = ({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) => {
  return (
    <img
      className={clsx("w-10 h-10 rounded-full", className && className)}
      src={src}
      alt={alt}
    />
  );
};

export default Avatar;