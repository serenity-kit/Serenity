import { BoxShadow, tw, View } from "@serenity-tools/ui";
import { useLayoutEffect, useRef } from "react";
import { useWindowDimensions } from "react-native";
import { OS } from "../../utils/platform/platform";

type Props = {
  navigation: any;
  children: React.ReactNode;
};

export default function NavigationDrawerModal(props: Props) {
  const dimensions = useWindowDimensions();
  const wrapperRef = useRef<null>(null);
  const contentRef = useRef<null>(null);

  useLayoutEffect(() => {
    if (OS === "web" || OS === "electron") {
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
        modalGroup.style.backgroundColor = tw.color("backdrop");
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

  if (OS === "web" || OS === "electron") {
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
            style={[
              tw`max-w-navigation-drawer-modal`,
              {
                backgroundColor: "white",
                width: dimensions.width * 0.95,
                height: dimensions.height * 0.8,
              },
            ]}
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
