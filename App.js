import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import ReunionsList from "./Components/ReunionsList";
import AddReunion from "./Components/AddReunion";
import ReunionItem from "./Components/ReunionItem";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={ReunionsList}
          options={{ title: "Liste des réunions" }}
        />
        <Stack.Screen
          name="Add"
          component={AddReunion}
          options={{ title: "Ajouter une réunion" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
