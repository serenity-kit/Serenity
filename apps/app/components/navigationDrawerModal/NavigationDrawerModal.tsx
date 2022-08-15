import { BoxShadow, View } from "@serenity-tools/ui";
import { useLayoutEffect, useRef } from "react";
import { Platform, useWindowDimensions } from "react-native";

type Props = {
  navigation: any;
  children: React.ReactNode;
};

export default function NavigationDrawerModal(props: Props) {
  const dimensions = useWindowDimensions();
  const wrapperRef = useRef<null>(null);
  const contentRef = useRef<null>(null);

  useLayoutEffect(() => {
    if (Platform.OS === "web") {
      const modalGroup =
        // @ts-ignore
        wrapperRef.current?.parentNode?.parentNode?.parentNode || null;

      // since we have stack navigator multiple screens are rendered, but set to display none
      if ((modalGroup?.parentNode?.children?.length || 0) > 1) {
        const previousScreen =
          modalGroup?.parentNode?.children[
            modalGroup.parentNode.children.length - 2
          ];
        // make sure the main content is available
        previousScreen.style.display = "block";
      }
      if (modalGroup) {
        modalGroup.style.backgroundColor = "rgba(255, 255, 255, 0.5)";
      }

      const overlayClickHandler = (event) => {
        // @ts-expect-error the ref must exists
        if (!contentRef.current.contains(event.target)) {
          if (props.navigation.canGoBack()) {
            props.navigation.goBack();
          } else {
            props.navigation.navigate("Root");
          }
        }
      };

      // add event listener to close modal on click outside of modal
      if (modalGroup) {
        modalGroup.addEventListener("click", overlayClickHandler);
      }

      return () => {
        if (modalGroup) {
          modalGroup.removeEventListener("click", overlayClickHandler);
        }
      };
    }
  });

  if (Platform.OS === "web") {
    return (
      <View
        ref={wrapperRef}
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <BoxShadow elevation={2} rounded>
          <View
            ref={contentRef}
            style={{
              backgroundColor: "white",
              width: dimensions.width * 0.8,
              height: dimensions.height * 0.8,
            }}
          >
            {props.children}
          </View>
        </BoxShadow>
      </View>
    );
  } else {
    return <>{props.children}</>;
  }
}
