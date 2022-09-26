import { ISpinnerProps, Spinner as NativeBaseSpinner } from "native-base";
import React, { forwardRef, useEffect, useState } from "react";
import { Animated, Platform } from "react-native";

export type SpinnerProps = ISpinnerProps & {
  fadeIn?: boolean;
};

export const Spinner = forwardRef((props: SpinnerProps, ref) => {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      useNativeDriver: Platform.OS === "web" ? false : true,
      toValue: 1,
      duration: 1500,
      delay: 200,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View
      style={{
        opacity: props.fadeIn ? fadeAnim : 1,
      }}
    >
      <NativeBaseSpinner ref={ref} {...props} />
    </Animated.View>
  );
});
