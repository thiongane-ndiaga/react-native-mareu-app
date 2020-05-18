import React from "react";
import ReunionItem from "./ReunionItem";
import {
  FlatList,
  StyleSheet,
  View,
  TouchableOpacity,
  StatusBar,
  Text,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Button, Icon } from "react-native-elements";
import { Dropdown } from "react-native-material-dropdown";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import salles from "../Helpers/sallesData";
import moment from "moment";
import "moment/locale/fr";
import firebase from "../firebaseConfig";

moment.defaultFormat = "DD/MM/YYYY";
const today = new Date();

export default class ReunionsList extends React.Component {
  constructor(props) {
    super(props);
    this.navigation = props.navigation;
    this.dbRef = firebase.firestore().collection("reunions");
    this.state = {
      show: false,
      isDatePickerVisible: false,
      selectedDate: "",
      filtering: false,
      isLoading: true,
      reunions: [],
      selectedSalle: 0,
      errorText: "",
    };
  }

  showFilterForm(show) {
    this.setState({ show: show });
  }

  setDatePickerVisibility(visible) {
    this.setState({ isDatePickerVisible: visible });
  }

  componentDidMount() {
    this.unsuscribe = this.dbRef.onSnapshot(this.getCollection);
  }
  componentWillUnmount() {
    this.unsuscribe();
  }
  getCollection = (querySnapshot) => {
    const reunions = [];
    querySnapshot.forEach((res) => {
      const { sujet, date, heure, salle, participants } = res.data();
      reunions.push({
        id: res.id,
        sujet,
        date,
        heure,
        salle,
        participants,
      });
    });
    this.setState({
      isLoading: false,
      reunions,
    });
  };

  doFilter() {
    let date = this.state.selectedDate;
    let salle = this.state.selectedSalle;
    if (date == "" && salle == 0) {
      this.setState({
        errorText: "Choississez une date et/ou une salle d'abord !",
      });
    } else {
      this.setState({ filtering: true });
      let reunions = [];
      if (date != "" && salle == 0) {
        this.state.reunions.forEach((reunion) => {
          if (reunion.date == date) {
            reunions.push(reunion);
          }
        });
      } else if (date == "" && salle != 0) {
        this.state.reunions.forEach((reunion) => {
          if (reunion.salle == salle) {
            reunions.push(reunion);
          }
        });
      } else {
        this.state.reunions.forEach((reunion) => {
          if (reunion.date == date && reunion.salle == salle) {
            reunions.push(reunion);
          }
        });
      }
      this.setState({ reunions: reunions });
      this.showFilterForm(false);
    }
  }
  dontFilter() {
    if (this.state.filtering) {
      this.setState({ filtering: false, selectedDate: "", selectedSalle: 0 });
      this.componentDidMount();
    }
    this.showFilterForm(false);
  }
  render() {
    const reunions = this.state.reunions;

    const handleConfirm = (date) => {
      this.setState({ selectedDate: moment(date).format("DD/MM/YYYY") });
      this.setDatePickerVisibility(false);
    };
    return (
      <LinearGradient
        colors={["#a54f79", "#fff"]}
        style={styles.main_container}
      >
        <StatusBar barStyle="dark-content" />
        <View style={styles.filter_buttons_container}>
          <Button
            title="Filtrer"
            icon={
              <Icon
                name="filter"
                size={20}
                color="white"
                type="material-community"
              />
            }
            buttonStyle={styles.filter_buttons}
            onPress={() => this.showFilterForm(true)}
          />
          <Button
            icon={
              <Icon
                name="filter-remove-outline"
                size={21}
                color="white"
                type="material-community"
              />
            }
            buttonStyle={styles.filter_buttons}
            onPress={() => this.dontFilter()}
          />
        </View>
        {this.state.filtering ? (
          <Text style={styles.filtering}>Filtre actif</Text>
        ) : null}
        {this.state.show ? (
          <View style={styles.filtering_container}>
            <Button
              title="Sélectionner une date"
              icon={
                <Icon
                  name="calendar"
                  size={20}
                  color="white"
                  type="material-community"
                />
              }
              type="clear"
              onPress={() => this.setDatePickerVisibility(true)}
              buttonStyle={styles.filter_buttons}
              titleStyle={{ color: "white" }}
            />
            <DateTimePickerModal
              headerTextIOS="Sélectionnez une date"
              isVisible={this.state.isDatePickerVisible}
              mode="date"
              date={today}
              minimumDate={today}
              onConfirm={handleConfirm}
              onCancel={() => this.setDatePickerVisibility(false)}
              locale="fr-FR"
              cancelTextIOS="Annuler"
              confirmTextIOS="Confirmer"
            />
            {this.state.selectedDate ? (
              <Text style={styles.picked_date_text}>
                {this.state.selectedDate}
              </Text>
            ) : null}
            <Dropdown
              label="Sélectionner une salle"
              data={salles}
              fontSize={20}
              textColor="#7DC1BF"
              onChangeText={(_, id) => this.setState({ selectedSalle: id + 1 })}
            />
            <Button
              title="Confirmer"
              icon={
                <Icon
                  name="check"
                  size={20}
                  color="black"
                  type="font-awesome"
                />
              }
              buttonStyle={{ backgroundColor: "#7DC1BF" }}
              titleStyle={{ color: "black" }}
              onPress={() => this.doFilter()}
            />
            <Text style={styles.errorText}>{this.state.errorText}</Text>
          </View>
        ) : null}
        {this.state.isLoading ? (
          <View style={{ flex: 1, justifyContent: "center" }}>
            <ActivityIndicator size="large" color="#373F51"></ActivityIndicator>
          </View>
        ) : null}
        {reunions.length > 0 ? (
          <FlatList
            data={reunions}
            keyExtractor={(item) => item.id}
            renderItem={(item) => <ReunionItem reunion={item} />}
          />
        ) : !this.state.isLoading ? (
          <View style={styles.empty_container}>
            <Text style={styles.empty_text}>Pas de réunion !</Text>
          </View>
        ) : null}
        <TouchableOpacity style={styles.add_icon_container}>
          <Icon
            reverse
            name="add"
            size={26}
            color="#a54f79"
            type="material"
            onPress={() => this.navigation.navigate("Add")}
          />
        </TouchableOpacity>
      </LinearGradient>
    );
  }
}
const styles = StyleSheet.create({
  main_container: {
    flex: 1,
    padding: 0,
  },
  filter_buttons_container: {
    flexDirection: "row",
    alignSelf: "center",
    alignItems: "center",
    padding: 15,
  },
  filter_buttons: {
    backgroundColor: "#373F51",
    marginHorizontal: 7.5,
  },
  add_icon_container: {
    position: "absolute",
    bottom: 5,
    right: 5,
  },
  filtering_container: {
    paddingHorizontal: 30,
    paddingBottom: 15,
    justifyContent: "center",
  },
  picked_date_text: {
    fontSize: 20,
    color: "#7DC1BF",
    fontWeight: "bold",
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    fontWeight: "bold",
  },
  filtering: {
    fontSize: 18,
    fontWeight: "bold",
    fontStyle: "italic",
    textAlign: "center",
    color: "#7DC1BF",
    marginBottom: 7.5,
  },
  empty_container: { flex: 1, justifyContent: "center", alignItems: "center" },
  empty_text: { fontSize: 20, fontWeight: "bold" },
});
