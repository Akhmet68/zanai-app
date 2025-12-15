import { NavigationContainer } from "@react-navigation/native";
import RootNavigator from "./app/navigation_root/RootNavigator";

export default function App() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}
