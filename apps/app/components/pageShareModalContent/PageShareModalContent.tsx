import { Button, Checkbox, Text } from "@serenity-tools/ui";
import React, { useState } from "react";

export function PageShareModalContent() {
  const [isLinkSharing, setIsLinkSharing] = useState(false);

  return (
    <>
      <Checkbox
        value={"linkSharing"}
        isChecked={isLinkSharing}
        onChange={setIsLinkSharing}
      >
        <Text variant="xs" muted>
          Share via Link
        </Text>
      </Checkbox>
      {isLinkSharing ? (
        <>
          <Text>https://example.com/dummy/link</Text>
          <Button size="small">Copy</Button>
        </>
      ) : null}
    </>
  );
}
