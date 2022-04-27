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
import { CodeView } from "./icons/CodeView";
import { DoubleQuotesL } from "./icons/DoubleQuotesL";
import { FileSearchLine } from "./icons/FileSearchLine";
import { FileTransferLine } from "./icons/FileTransferLine";
import { FolderMusicLine } from "./icons/FolderMusicLine";
import { FontColor } from "./icons/FontColor";
import { FontSize2 } from "./icons/FontSize2";
import { FormatClear } from "./icons/FormatClear";
import { Functions } from "./icons/Functions";
import { Hashtag } from "./icons/Hashtag";
import { Heading } from "./icons/Heading";
import { H1 } from "./icons/H1";
import { H2 } from "./icons/H2";
import { H3 } from "./icons/H3";
import { H4 } from "./icons/H4";
import { H5 } from "./icons/H5";
import { H6 } from "./icons/H6";
import { IndentDecrease } from "./icons/IndentDecrease";
import { IndentIncrease } from "./icons/IndentIncrease";
import { Italic } from "./icons/Italic";
import { Link } from "./icons/Link";
import { LinkM } from "./icons/LinkM";
import { ListCheck2 } from "./icons/ListCheck2";
import { ListOrdered } from "./icons/ListOrdered";
import { ListUnordered } from "./icons/ListUnordered";
import { PageSeparator } from "./icons/PageSeparator";
import { Paragraph } from "./icons/Paragraph";
import { PrinterLine } from "./icons/PrinterLine";
import { QuestionMark } from "./icons/QuestionMark";
import { Separator } from "./icons/Separator";
import { Strikethrough } from "./icons/Strikethrough";
import { Table2 } from "./icons/Table2";
import { Text } from "./icons/Text";
import { Underline } from "./icons/Underline";

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
    | "code-view"
    | "double-quotes-l"
    | "file-search-line"
    | "file-transfer-line"
    | "folder-music-line"
    | "font-color"
    | "font-size-2"
    | "format-clear"
    | "functions"
    | "hashtag"
    | "heading"
    | "h-1"
    | "h-2"
    | "h-3"
    | "h-4"
    | "h-5"
    | "h-6"
    | "indent-decrease"
    | "indent-increase"
    | "italic"
    | "link"
    | "link-m"
    | "list-check-2"
    | "list-unordered"
    | "list-ordered"
    | "page-separator"
    | "paragraph"
    | "printer-line"
    | "question-mark"
    | "separator"
    | "strikethrough"
    | "table-2"
    | "text"
    | "underline";
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
  if (name === "code-view") return <CodeView color={color} size={size} />;
  if (name === "double-quotes-l")
    return <DoubleQuotesL color={color} size={size} />;
  if (name === "file-search-line")
    return <FileSearchLine color={color} size={size} />;
  if (name === "file-transfer-line")
    return <FileTransferLine color={color} size={size} />;
  if (name === "folder-music-line")
    return <FolderMusicLine color={color} size={size} />;
  if (name === "font-color") return <FontColor color={color} size={size} />;
  if (name === "font-size-2") return <FontSize2 color={color} size={size} />;
  if (name === "format-clear") return <FormatClear color={color} size={size} />;
  if (name === "functions") return <Functions color={color} size={size} />;
  if (name === "hashtag") return <Hashtag color={color} size={size} />;
  if (name === "heading") return <Heading color={color} size={size} />;
  if (name === "h-1") return <H1 color={color} size={size} />;
  if (name === "h-2") return <H2 color={color} size={size} />;
  if (name === "h-3") return <H3 color={color} size={size} />;
  if (name === "h-4") return <H4 color={color} size={size} />;
  if (name === "h-5") return <H5 color={color} size={size} />;
  if (name === "h-6") return <H6 color={color} size={size} />;
  if (name === "indent-decrease")
    return <IndentDecrease color={color} size={size} />;
  if (name === "indent-increase")
    return <IndentIncrease color={color} size={size} />;
  if (name === "italic") return <Italic color={color} size={size} />;
  if (name === "link") return <Link color={color} size={size} />;
  if (name === "link-m") return <LinkM color={color} size={size} />;
  if (name === "list-check-2") return <ListCheck2 color={color} size={size} />;
  if (name === "list-ordered") return <ListOrdered color={color} size={size} />;
  if (name === "list-unordered")
    return <ListUnordered color={color} size={size} />;
  if (name === "page-separator")
    return <PageSeparator color={color} size={size} />;
  if (name === "paragraph") return <Paragraph color={color} size={size} />;
  if (name === "printer-line") return <PrinterLine color={color} size={size} />;
  if (name === "question-mark")
    return <QuestionMark color={color} size={size} />;
  if (name === "separator") return <Separator color={color} size={size} />;
  if (name === "strikethrough")
    return <Strikethrough color={color} size={size} />;
  if (name === "table-2") return <Table2 color={color} size={size} />;
  if (name === "text") return <Text color={color} size={size} />;
  if (name === "underline") return <Underline color={color} size={size} />;
  return null;
};
