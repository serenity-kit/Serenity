import { Button, Checkbox, Input, Text } from "@serenity-tools/ui";
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
          <Checkbox value={"canComment"} isChecked={true} isDisabled>
            <Text variant="xs" muted>
              Can comment
            </Text>
          </Checkbox>
          <Checkbox value={"canEdit"} isChecked={true} isDisabled>
            <Text variant="xs" muted>
              Can edit
            </Text>
          </Checkbox>
          <Text></Text>
          <Input
            label={"Link"}
            value={"https://example.com/dummy/link"}
            isDisabled
          />
          <Button size="sm">Copy</Button>
        </>
      ) : null}
    </>
  );
}
