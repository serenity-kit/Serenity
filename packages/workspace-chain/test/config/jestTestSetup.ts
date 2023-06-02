import sodium from "react-native-libsodium";

module.exports = async function () {
  await sodium.ready;
};
