import React from "react";
import { tw } from "../../tailwind";
import { ArchiveLine } from "./icons/ArchiveLine";
import { AtLine } from "./icons/AtLine";
import { Bold } from "./icons/Bold";
import { BookOpenLine } from "./icons/BookOpenLine";
import { CalendarCheckFill } from "./icons/CalendarCheckFill";
import { Chat1Line } from "./icons/Chat1Line";
import { Chat4Line } from "./icons/Chat4Line";
import { CodeSSlashLine } from "./icons/CodeSSlashLine";
import { FileSearchLine } from "./icons/FileSearchLine";
import { FileTransferLine } from "./icons/FileTransferLine";
import { FolderMusicLine } from "./icons/FolderMusicLine";
import { FontColor } from "./icons/FontColor";
import { Italic } from "./icons/Italic";
import { ListCheck2 } from "./icons/ListCheck2";
import { ListOrdered } from "./icons/ListOrdered";
import { ListUnordered } from "./icons/ListUnordered";
import { PrinterLine } from "./icons/PrinterLine";

export type Props = {
  name:
    | "archive-line"
    | "at-line"
    | "bold"
    | "book-open-line"
    | "calendar-check-fill"
    | "chat-1-line"
    | "chat-4-line"
    | "code-s-slash-line"
    | "file-search-line"
    | "file-transfer-line"
    | "folder-music-line"
    | "font-color"
    | "italic"
    | "list-check-2"
    | "list-unordered"
    | "list-ordered"
    | "printer-line";
  color?: string;
  size?: number;
};

export const Icon = (props: Props) => {
  const { name } = props;
  const color = props.color ?? (tw.color("gray-900") as string);
  const size = props.size ?? 24;
  if (name === "archive-line") return <ArchiveLine color={color} size={size} />;
  if (name === "at-line") return <AtLine color={color} size={size} />;
  if (name === "bold") return <Bold color={color} size={size} />;
  if (name === "book-open-line")
    return <BookOpenLine color={color} size={size} />;
  if (name === "calendar-check-fill")
    return <CalendarCheckFill color={color} size={size} />;
  if (name === "chat-1-line") return <Chat1Line color={color} size={size} />;
  if (name === "chat-4-line") return <Chat4Line color={color} size={size} />;
  if (name === "code-s-slash-line")
    return <CodeSSlashLine color={color} size={size} />;
  if (name === "file-search-line")
    return <FileSearchLine color={color} size={size} />;
  if (name === "file-transfer-line")
    return <FileTransferLine color={color} size={size} />;
  if (name === "folder-music-line")
    return <FolderMusicLine color={color} size={size} />;
  if (name === "font-color") return <FontColor color={color} size={size} />;
  if (name === "italic") return <Italic color={color} size={size} />;
  if (name === "list-check-2") return <ListCheck2 color={color} size={size} />;
  if (name === "list-ordered") return <ListOrdered color={color} size={size} />;
  if (name === "list-unordered")
    return <ListUnordered color={color} size={size} />;
  if (name === "printer-line") return <PrinterLine color={color} size={size} />;
  return null;
};
