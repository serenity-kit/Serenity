import React from "react";
import { tw } from "@serenity-tools/ui";

const classes =
  "flex-none items-center justify-center w-6 h-6 text-[12px] border-solid border-2 border-gray-200 rounded bg-gray-100 font-bold";
const activeClasses = "bg-primary-400";

type ButtonProps = {
  onClick?: () => void;
  isActive: boolean;
  children: React.ReactNode;
};

export default function EditorButton(props: ButtonProps) {
  const { onClick, isActive, children } = props;

  return (
    <button
      onClick={onClick}
      style={tw.style(classes, isActive ? activeClasses : "")}
    >
      {children}
    </button>
  );
}
