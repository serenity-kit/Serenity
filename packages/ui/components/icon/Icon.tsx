import React from "react";
import { tw } from "../../tailwind";
import { AddLine } from "./icons/AddLine";
import { ArchiveFill } from "./icons/ArchiveFill";
import { ArchiveLine } from "./icons/ArchiveLine";
import { ArrowDownFilled } from "./icons/ArrowDownFilled";
import { ArrowDownSFill } from "./icons/ArrowDownSFill";
import { ArrowDownSLine } from "./icons/ArrowDownSLine";
import { ArrowGoBackFill } from "./icons/ArrowGoBackFill";
import { ArrowGoBackLine } from "./icons/ArrowGoBackLine";
import { ArrowGoForwardLine } from "./icons/ArrowGoForwardLine";
import { ArrowGoForwardFill } from "./icons/ArrowGoForwardFill";
import { ArrowLeftLine } from "./icons/ArrowLeftLine";
import { ArrowLeftSLine } from "./icons/ArrowLeftSLine";
import { ArrowRight } from "./icons/ArrowRight";
import { ArrowRightFilled } from "./icons/ArrowRightFilled";
import { ArrowRightSLine } from "./icons/ArrowRightSLine";
import { ArrowUpLine } from "./icons/ArrowUpLine";
import { ArrowUpDownLine } from "./icons/ArrowUpDownLine";
import { ArrowUpDownSLine } from "./icons/ArrowUpDownSLine";
import { Attachment2 } from "./icons/Attachment2";
import { AtLine } from "./icons/AtLine";
import { Bold } from "./icons/Bold";
import { BookmarkFill } from "./icons/BookmarkFill";
import { BookmarkLine } from "./icons/BookmarkLine";
import { BookOpenLine } from "./icons/BookOpenLine";
import { CalendarCheckFill } from "./icons/CalendarCheckFill";
import { Chat1Line } from "./icons/Chat1Line";
import { Chat1LineMessage } from "./icons/Chat1LineMessage";
import { Chat4Fill } from "./icons/Chat4Fill";
import { Chat4Line } from "./icons/Chat4Line";
import { Chat4LineMessage } from "./icons/Chat4LineMessage";
import { CheckLine } from "./icons/CheckLine";
import { ChitChat } from "./icons/ChitChat";
import { CloseCircleFill } from "./icons/CloseCircleFill";
import { CodeSSlashLine } from "./icons/CodeSSlashLine";
import { CodeView } from "./icons/CodeView";
import { CommandLine } from "./icons/CommandLine";
import { ComputerLine } from "./icons/ComputerLine";
import { CupLine } from "./icons/CupLine";
import { Cursor } from "./icons/Cursor";
import { DashboardLine } from "./icons/DashboardLine";
import { DeleteBinLine } from "./icons/DeleteBinLine";
import { DeviceLine } from "./icons/DeviceLine";
import { DoubleArrowLeft } from "./icons/DoubleArrowLeft";
import { DoubleArrowRight } from "./icons/DoubleArrowRight";
import { DoubleQuotesL } from "./icons/DoubleQuotesL";
import { DownloadLine } from "./icons/DownloadLine";
import { DraftLine } from "./icons/DraftLine";
import { EarthFill } from "./icons/EarthFill";
import { EmotionLine } from "./icons/EmotionLine";
import { ErrorWarningLine } from "./icons/ErrorWarningLine";
import { ExternalLinkLine } from "./icons/ExternalLinkLine";
import { FileAddFill } from "./icons/FileAddFill";
import { FileAddLine } from "./icons/FileAddLine";
import { FileCopyLine } from "./icons/FileCopyLine";
import { FileLine } from "./icons/FileLine";
import { FileSearchLine } from "./icons/FileSearchLine";
import { FileTransferLine } from "./icons/FileTransferLine";
import { Folder } from "./icons/Folder";
import { FolderMusicLine } from "./icons/FolderMusicLine";
import { FolderFill } from "./icons/FolderFill";
import { FolderLine } from "./icons/FolderLine";
import { FontColor } from "./icons/FontColor";
import { FontSize2 } from "./icons/FontSize2";
import { FormatClear } from "./icons/FormatClear";
import { Functions } from "./icons/Functions";
import { GroupLine } from "./icons/GroupLine";
import { H1 } from "./icons/H1";
import { H2 } from "./icons/H2";
import { H3 } from "./icons/H3";
import { H4 } from "./icons/H4";
import { H5 } from "./icons/H5";
import { H6 } from "./icons/H6";
import { Hashtag } from "./icons/Hashtag";
import { Heading } from "./icons/Heading";
import { HistoryLine } from "./icons/HistoryLine";
import { Image2Line } from "./icons/Image2Line";
import { ImageLine } from "./icons/ImageLine";
import { IndentDecrease } from "./icons/IndentDecrease";
import { IndentIncrease } from "./icons/IndentIncrease";
import { InformationFill } from "./icons/InformationFill";
import { InformationLine } from "./icons/InformationLine";
import { Italic } from "./icons/Italic";
import { Link } from "./icons/Link";
import { LinkM } from "./icons/LinkM";
import { ListCheck } from "./icons/ListCheck";
import { ListCheck2 } from "./icons/ListCheck2";
import { ListOrdered } from "./icons/ListOrdered";
import { ListUnordered } from "./icons/ListUnordered";
import { LockUnlockLineClose } from "./icons/LockUnlockLineClose";
import { Menu } from "./icons/Menu";
import { MicroscopeLine } from "./icons/MicroscopeLine";
import { More } from "./icons/More";
import { More2Fill } from "./icons/More2Fill";
import { More2Line } from "./icons/More2Line";
import { MoreLine } from "./icons/MoreLine";
import { MovieLine } from "./icons/MovieLine";
import { Page } from "./icons/Page";
import { PageSeparator } from "./icons/PageSeparator";
import { Paragraph } from "./icons/Paragraph";
import { PencilLine } from "./icons/PencilLine";
import { Plus } from "./icons/Plus";
import { PrinterLine } from "./icons/PrinterLine";
import { QuestionMark } from "./icons/QuestionMark";
import { SearchLine } from "./icons/SearchLine";
import { Separator } from "./icons/Separator";
import { SerenityFeather } from "./icons/SerenityFeather";
import { Settings4Line } from "./icons/Settings4Line";
import { ShareLine } from "./icons/ShareLine";
import { ShareBoxLine } from "./icons/ShareBoxLine";
import { StarSFill } from "./icons/StarSFill";
import { Strikethrough } from "./icons/Strikethrough";
import { Table2 } from "./icons/Table2";
import { Text } from "./icons/Text";
import { Underline } from "./icons/Underline";
import { UserLine } from "./icons/UserLine";
import { UserSettingsLine } from "./icons/UserSettingsLine";
import { WarningFill } from "./icons/WarningFill";
import { WindowLine } from "./icons/WindowLine";

import { View } from "react-native";
import { useIsSmallerThanBreakpoint } from "../../hooks/useIsSmallerThanBreakpoint/useIsSmallerThanBreakpoint";
import { Color } from "../../types";

export type IconNames =
  | "add-line"
  | "archive-fill"
  | "archive-line"
  | "arrow-down-filled"
  | "arrow-down-s-fill"
  | "arrow-down-s-line"
  | "arrow-go-back-fill"
  | "arrow-go-back-line"
  | "arrow-go-forward-fill"
  | "arrow-go-forward-line"
  | "arrow-left-line"
  | "arrow-left-s-line"
  | "arrow-right"
  | "arrow-right-filled"
  | "arrow-right-s-line"
  | "arrow-up-line"
  | "arrow-up-down-line"
  | "arrow-up-down-s-line"
  | "at-line"
  | "attachment-2"
  | "bold"
  | "bookmark-fill"
  | "bookmark-line"
  | "book-open-line"
  | "calendar-check-fill"
  | "chat-1-line"
  | "chat-1-line-message"
  | "chat-4-fill"
  | "chat-4-line"
  | "chat-4-line-message"
  | "check-line"
  | "chit-chat"
  | "close-circle-fill"
  | "code-s-slash-line"
  | "code-view"
  | "command-line"
  | "computer-line"
  | "cup-line"
  | "cursor"
  | "dashboard-line"
  | "delete-bin-line"
  | "device-line"
  | "double-arrow-right"
  | "double-arrow-left"
  | "double-quotes-l"
  | "download-line"
  | "draft-line"
  | "earth-fill"
  | "emotion-line"
  | "error-warning-line"
  | "external-link-line"
  | "file-add-fill"
  | "file-add-line"
  | "file-copy-line"
  | "file-line"
  | "file-search-line"
  | "file-transfer-line"
  | "folder-fill"
  | "folder"
  | "folder-line"
  | "folder-music-line"
  | "font-color"
  | "font-size-2"
  | "format-clear"
  | "functions"
  | "group-line"
  | "h-1"
  | "h-2"
  | "h-3"
  | "h-4"
  | "h-5"
  | "h-6"
  | "hashtag"
  | "heading"
  | "history-line"
  | "image-2-line"
  | "image-line"
  | "indent-decrease"
  | "indent-increase"
  | "information-fill"
  | "information-line"
  | "italic"
  | "link"
  | "link-m"
  | "list-check"
  | "list-check-2"
  | "list-unordered"
  | "list-ordered"
  | "lock-unlock-line-close"
  | "menu"
  | "microscope-line"
  | "more"
  | "more-2-fill"
  | "more-2-line"
  | "more-line"
  | "movie-line"
  | "page"
  | "page-separator"
  | "paragraph"
  | "pencil-line"
  | "plus"
  | "printer-line"
  | "question-mark"
  | "search-line"
  | "separator"
  | "serenity-feather"
  | "settings-4-line"
  | "share-line"
  | "share-box-line"
  | "stars-s-fill"
  | "strikethrough"
  | "table-2"
  | "text"
  | "underline"
  | "user-line"
  | "user-settings-line"
  | "warning-fill"
  | "window-line";

export type IconProps = {
  name: IconNames;
  color?: Color;
  size?: number | "full";
  mobileSize?: number | "full";
};

export const Icon = (props: IconProps) => {
  const { name } = props;
  const color = tw.color(props.color ?? "gray-900") as string;
  const actualSize = props.size ?? 4;
  const actualMobileSize = props.mobileSize ?? 5;

  const size = useIsSmallerThanBreakpoint("md") ? actualMobileSize : actualSize;
  const iconSize = "100%";

  let icon: React.ReactNode = null;

  if (name === "add-line") {
    icon = <AddLine color={color} size={iconSize} />;
  }
  if (name === "archive-fill") {
    icon = <ArchiveFill color={color} size={iconSize} />;
  }
  if (name === "archive-line") {
    icon = <ArchiveLine color={color} size={iconSize} />;
  }
  if (name === "arrow-down-filled") {
    icon = <ArrowDownFilled color={color} size={iconSize} />;
  }
  if (name === "arrow-down-s-fill") {
    icon = <ArrowDownSFill color={color} size={iconSize} />;
  }
  if (name === "arrow-down-s-line") {
    icon = <ArrowDownSLine color={color} size={iconSize} />;
  }
  if (name === "arrow-go-back-fill") {
    icon = <ArrowGoBackFill color={color} size={iconSize} />;
  }
  if (name === "arrow-go-back-line") {
    icon = <ArrowGoBackLine color={color} size={iconSize} />;
  }
  if (name === "arrow-go-forward-fill") {
    icon = <ArrowGoForwardFill color={color} size={iconSize} />;
  }
  if (name === "arrow-go-forward-line") {
    icon = <ArrowGoForwardLine color={color} size={iconSize} />;
  }
  if (name === "arrow-left-s-line") {
    icon = <ArrowLeftSLine color={color} size={iconSize} />;
  }
  if (name === "arrow-left-line") {
    icon = <ArrowLeftLine color={color} size={iconSize} />;
  }
  if (name === "arrow-right-s-line") {
    icon = <ArrowRightSLine color={color} size={iconSize} />;
  }
  if (name === "arrow-right-filled") {
    icon = <ArrowRightFilled color={color} size={iconSize} />;
  }
  if (name === "arrow-right") {
    icon = <ArrowRight color={color} size={iconSize} />;
  }
  if (name === "arrow-up-line") {
    icon = <ArrowUpLine color={color} size={iconSize} />;
  }
  if (name === "arrow-up-down-line") {
    icon = <ArrowUpDownLine color={color} size={iconSize} />;
  }
  if (name === "arrow-up-down-s-line") {
    icon = <ArrowUpDownSLine color={color} size={iconSize} />;
  }
  if (name === "attachment-2") {
    icon = <Attachment2 color={color} size={iconSize} />;
  }
  if (name === "at-line") {
    icon = <AtLine color={color} size={iconSize} />;
  }
  if (name === "bold") {
    icon = <Bold color={color} size={iconSize} />;
  }
  if (name === "bookmark-fill") {
    icon = <BookmarkFill color={color} size={iconSize} />;
  }
  if (name === "bookmark-line") {
    icon = <BookmarkLine color={color} size={iconSize} />;
  }
  if (name === "book-open-line") {
    icon = <BookOpenLine color={color} size={iconSize} />;
  }
  if (name === "calendar-check-fill") {
    icon = <CalendarCheckFill color={color} size={iconSize} />;
  }
  if (name === "chat-1-line") {
    icon = <Chat1Line color={color} size={iconSize} />;
  }
  if (name === "chat-1-line-message") {
    icon = <Chat1LineMessage color={color} size={iconSize} />;
  }
  if (name === "chat-4-fill") {
    icon = <Chat4Fill color={color} size={iconSize} />;
  }
  if (name === "chat-4-line") {
    icon = <Chat4Line color={color} size={iconSize} />;
  }
  if (name === "chat-4-line-message") {
    icon = <Chat4LineMessage color={color} size={iconSize} />;
  }
  if (name === "check-line") {
    icon = <CheckLine color={color} size={iconSize} />;
  }
  if (name === "chit-chat") {
    icon = <ChitChat color={color} size={iconSize} />;
  }
  if (name === "close-circle-fill") {
    icon = <CloseCircleFill color={color} size={iconSize} />;
  }
  if (name === "code-s-slash-line") {
    icon = <CodeSSlashLine color={color} size={iconSize} />;
  }
  if (name === "code-view") {
    icon = <CodeView color={color} size={iconSize} />;
  }
  if (name === "command-line") {
    icon = <CommandLine color={color} size={iconSize} />;
  }
  if (name === "computer-line") {
    icon = <ComputerLine color={color} size={iconSize} />;
  }
  if (name === "cup-line") {
    icon = <CupLine color={color} size={iconSize} />;
  }
  if (name === "cursor") {
    icon = <Cursor color={color} size={iconSize} />;
  }
  if (name === "dashboard-line") {
    icon = <DashboardLine color={color} size={iconSize} />;
  }
  if (name === "delete-bin-line") {
    icon = <DeleteBinLine color={color} size={iconSize} />;
  }
  if (name === "device-line") {
    icon = <DeviceLine color={color} size={iconSize} />;
  }
  if (name === "double-arrow-left") {
    icon = <DoubleArrowLeft color={color} size={iconSize} />;
  }
  if (name === "double-arrow-right") {
    icon = <DoubleArrowRight color={color} size={iconSize} />;
  }
  if (name === "double-quotes-l") {
    icon = <DoubleQuotesL color={color} size={iconSize} />;
  }
  if (name === "download-line") {
    icon = <DownloadLine color={color} size={iconSize} />;
  }
  if (name === "draft-line") {
    icon = <DraftLine color={color} size={iconSize} />;
  }
  if (name === "earth-fill") {
    icon = <EarthFill color={color} size={iconSize} />;
  }
  if (name === "emotion-line") {
    icon = <EmotionLine color={color} size={iconSize} />;
  }
  if (name === "error-warning-line") {
    icon = <ErrorWarningLine color={color} size={iconSize} />;
  }
  if (name === "external-link-line") {
    icon = <ExternalLinkLine color={color} size={iconSize} />;
  }
  if (name === "file-add-fill") {
    icon = <FileAddFill color={color} size={iconSize} />;
  }
  if (name === "file-add-line") {
    icon = <FileAddLine color={color} size={iconSize} />;
  }
  if (name === "file-copy-line") {
    icon = <FileCopyLine color={color} size={iconSize} />;
  }
  if (name === "file-line") {
    icon = <FileLine color={color} size={iconSize} />;
  }
  if (name === "file-search-line") {
    icon = <FileSearchLine color={color} size={iconSize} />;
  }
  if (name === "file-transfer-line") {
    icon = <FileTransferLine color={color} size={iconSize} />;
  }
  if (name === "folder-fill") {
    icon = <FolderFill color={color} size={iconSize} />;
  }
  if (name === "folder") {
    icon = <Folder size={iconSize} />;
  }
  if (name === "folder-line") {
    icon = <FolderLine color={color} size={iconSize} />;
  }
  if (name === "folder-music-line") {
    icon = <FolderMusicLine color={color} size={iconSize} />;
  }
  if (name === "font-color") {
    icon = <FontColor color={color} size={iconSize} />;
  }
  if (name === "font-size-2") {
    icon = <FontSize2 color={color} size={iconSize} />;
  }
  if (name === "format-clear") {
    icon = <FormatClear color={color} size={iconSize} />;
  }
  if (name === "functions") {
    icon = <Functions color={color} size={iconSize} />;
  }
  if (name === "group-line") {
    icon = <GroupLine color={color} size={iconSize} />;
  }
  if (name === "h-1") {
    icon = <H1 color={color} size={iconSize} />;
  }
  if (name === "h-2") {
    icon = <H2 color={color} size={iconSize} />;
  }
  if (name === "h-3") {
    icon = <H3 color={color} size={iconSize} />;
  }
  if (name === "h-4") {
    icon = <H4 color={color} size={iconSize} />;
  }
  if (name === "h-5") {
    icon = <H5 color={color} size={iconSize} />;
  }
  if (name === "h-6") {
    icon = <H6 color={color} size={iconSize} />;
  }
  if (name === "hashtag") {
    icon = <Hashtag color={color} size={iconSize} />;
  }
  if (name === "heading") {
    icon = <Heading color={color} size={iconSize} />;
  }
  if (name === "history-line") {
    icon = <HistoryLine color={color} size={iconSize} />;
  }
  if (name === "image-2-line") {
    icon = <Image2Line color={color} size={iconSize} />;
  }
  if (name === "image-line") {
    icon = <ImageLine color={color} size={iconSize} />;
  }
  if (name === "information-fill") {
    icon = <InformationFill color={color} size={iconSize} />;
  }
  if (name === "information-line") {
    icon = <InformationLine color={color} size={iconSize} />;
  }
  if (name === "indent-decrease") {
    icon = <IndentDecrease color={color} size={iconSize} />;
  }
  if (name === "indent-increase") {
    icon = <IndentIncrease color={color} size={iconSize} />;
  }
  if (name === "italic") {
    icon = <Italic color={color} size={iconSize} />;
  }
  if (name === "link") {
    icon = <Link color={color} size={iconSize} />;
  }
  if (name === "link-m") {
    icon = <LinkM color={color} size={iconSize} />;
  }
  if (name === "list-check") {
    icon = <ListCheck color={color} size={iconSize} />;
  }
  if (name === "list-check-2") {
    icon = <ListCheck2 color={color} size={iconSize} />;
  }
  if (name === "list-ordered") {
    icon = <ListOrdered color={color} size={iconSize} />;
  }
  if (name === "list-unordered") {
    icon = <ListUnordered color={color} size={iconSize} />;
  }
  if (name === "lock-unlock-line-close") {
    icon = <LockUnlockLineClose color={color} size={iconSize} />;
  }
  if (name === "menu") {
    icon = <Menu color={color} size={iconSize} />;
  }
  if (name === "microscope-line") {
    icon = <MicroscopeLine color={color} size={iconSize} />;
  }
  if (name === "more") {
    icon = <More color={color} size={iconSize} />;
  }
  if (name === "more-2-fill") {
    icon = <More2Fill color={color} size={iconSize} />;
  }
  if (name === "more-2-line") {
    icon = <More2Line color={color} size={iconSize} />;
  }
  if (name === "more-line") {
    icon = <MoreLine color={color} size={iconSize} />;
  }
  if (name === "movie-line") {
    icon = <MovieLine color={color} size={iconSize} />;
  }
  if (name === "page") {
    icon = <Page size={iconSize} />;
  }
  if (name === "page-separator") {
    icon = <PageSeparator color={color} size={iconSize} />;
  }
  if (name === "paragraph") {
    icon = <Paragraph color={color} size={iconSize} />;
  }
  if (name === "pencil-line") {
    icon = <PencilLine color={color} size={iconSize} />;
  }
  if (name === "plus") {
    icon = <Plus color={color} size={iconSize} />;
  }
  if (name === "printer-line") {
    icon = <PrinterLine color={color} size={iconSize} />;
  }
  if (name === "question-mark") {
    icon = <QuestionMark color={color} size={iconSize} />;
  }
  if (name === "search-line") {
    icon = <SearchLine color={color} size={iconSize} />;
  }
  if (name === "separator") {
    icon = <Separator color={color} size={iconSize} />;
  }
  if (name === "serenity-feather") {
    icon = <SerenityFeather color={color} size={iconSize} />;
  }
  if (name === "settings-4-line") {
    icon = <Settings4Line color={color} size={iconSize} />;
  }
  if (name === "share-line") {
    icon = <ShareLine color={color} size={iconSize} />;
  }
  if (name === "share-box-line") {
    icon = <ShareBoxLine color={color} size={iconSize} />;
  }
  if (name === "stars-s-fill") {
    icon = <StarSFill color={color} size={iconSize} />;
  }
  if (name === "strikethrough") {
    icon = <Strikethrough color={color} size={iconSize} />;
  }
  if (name === "table-2") {
    icon = <Table2 color={color} size={iconSize} />;
  }
  if (name === "text") {
    icon = <Text color={color} size={iconSize} />;
  }
  if (name === "underline") {
    icon = <Underline color={color} size={iconSize} />;
  }
  if (name === "user-line") {
    icon = <UserLine color={color} size={iconSize} />;
  }
  if (name === "user-settings-line") {
    icon = <UserSettingsLine color={color} size={iconSize} />;
  }
  if (name === "warning-fill") {
    icon = <WarningFill color={color} size={iconSize} />;
  }
  if (name === "window-line") {
    icon = <WindowLine color={color} size={iconSize} />;
  }

  if (!icon) return null;

  return <View style={tw`w-${size} h-${size}`}>{icon}</View>;
};
