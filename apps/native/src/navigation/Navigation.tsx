import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import CreateGoalScreen from "../screens/CreateGoalScreen";
import GoalsDashboardScreen from "../screens/GoalsDashboardScreen";
import InsideGoalScreen from "../screens/InsideGoalScreen";
import LoginScreen from "../screens/LoginScreen";

const Stack = createNativeStackNavigator();

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen
          name="GoalsDashboardScreen"
          component={GoalsDashboardScreen}
        />
        <Stack.Screen name="InsideGoalScreen" component={InsideGoalScreen} />
        <Stack.Screen name="CreateGoalScreen" component={CreateGoalScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
