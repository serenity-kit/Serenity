import React from "react";
import { tw } from "../../tailwind";
import { Link as ReactNavigationLink } from "@react-navigation/native";

export function Link(props) {
  return (
    <ReactNavigationLink
      {...props}
      style={tw.style(`text-blue-500 dark:text-blue-500`, props.style)}
    />
  );
}
