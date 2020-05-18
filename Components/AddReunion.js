import React from "react";
import { StyleSheet, Text, ActivityIndicator, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Card, Button, Icon } from "react-native-elements";
import { OutlinedTextField } from "react-native-material-textfield";
import { Dropdown } from "react-native-material-dropdown";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import TagInput from "react-native-tags-input";
import salles from "../Helpers/sallesData";
import Moment from "moment";
import "moment/locale/fr";
import { extendMoment } from "moment-range";
import firebase from "../firebaseConfig";
import validate from "validate.js";

const moment = extendMoment(Moment);
moment.defaultFormat = "DD/MM/YYYY HH:mm";
const today = new Date();
const constraint = {
  from: { email: { message: "bad" } },
};

export default class AddReunion extends React.Component {
  constructor(props) {
    super(props);
    this.dbRef = firebase.firestore().collection("reunions");
    this.navigation = props.navigation;
    this.state = {
      isDatePickerVisible: false,
      isTimePickerVisible: false,
      selectedDate: "",
      selectedTime: "",
      sujet: "",
      salle: 0,
      errorText: "",
      tags: {
        tag: "",
        tagsArray: [],
      },
      addLoading: false,
      preloading: true,
      reunions: [],
      heuresPrises: [],
    };
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
      preloading: false,
      reunions,
    });
  };

  setDatePickerVisibility(visible) {
    this.setState({ isDatePickerVisible: visible });
  }
  setTimePickerVisibility(visible) {
    this.setState({ isTimePickerVisible: visible });
  }
  onSubmit() {
    let date = this.state.selectedDate;
    let time = this.state.selectedTime;
    let sujet = this.state.sujet;
    let salle = this.state.salle;
    let participants = this.state.tags.tagsArray;

    if (
      date == "" ||
      time == "" ||
      sujet == "" ||
      salle == 0 ||
      participants.length < 3
    ) {
      this.setState({ errorText: "Remplissez tous les champs et critères !" });
    } else {
      let bad = false;
      participants.forEach((p) => {
        if (validate({ from: p }, constraint)) {
          bad = true;
        }
      });
      if (bad) {
        this.setState({ errorText: "Emails non valides !" });
      } else {
        let heuresPrises = [];
        let conflit = false;
        this.state.reunions.forEach((r) => {
          if (r.date == date && r.salle == salle) {
            let r_datetime = r.date + " " + r.heure;
            let datetime = moment(date + " " + time, moment.defaultFormat);
            let av45 = moment(r_datetime, moment.defaultFormat).subtract(
              45,
              "m"
            );
            let ap45 = moment(r_datetime, moment.defaultFormat).add(45, "m");
            let range = moment.range(av45, ap45);
            if (range.contains(datetime)) {
              conflit = true;
              heuresPrises.push(r.heure);
            }
          }
        });
        if (conflit) {
          this.setState({
            heuresPrises: heuresPrises,
            errorText:
              "Une ou plusieures réunions ont été programmées dans la salle " +
              salle +
              ", aux alentours de " +
              time +
              ", le " +
              moment(date, moment.defaultFormat).format("D MMMM") +
              " !\n Décalez de 45 minutes au moins.",
          });
        } else {
          this.setState({ addLoading: true });
          this.dbRef
            .add({
              sujet: sujet,
              date: date,
              heure: time,
              salle: salle,
              participants: participants,
            })
            .catch((err) => {
              console.error("Error found: ", err);
              this.setState({
                addLoading: false,
              });
            });
          this.navigation.navigate("Home");
        }
      }
    }
  }
  updateTagState = (state) => {
    this.setState({
      tags: state,
    });
  };
  heuresPrises() {
    return this.state.heuresPrises.map((h) => {
      return <Text style={styles.errorText}>{h}</Text>;
    });
  }
  render() {
    const handleConfirmDate = (date) => {
      this.setState({ selectedDate: moment(date).format("DD/MM/YYYY") });
      this.setDatePickerVisibility(false);
    };
    const handleConfirmTime = (date) => {
      this.setState({ selectedTime: moment(date).format("HH:mm") });
      this.setTimePickerVisibility(false);
    };
    return (
      <LinearGradient
        colors={["#a54f79", "#fff"]}
        style={styles.main_container}
      >
        {this.state.preloading ? (
          <View style={styles.preloading_container}>
            <ActivityIndicator color="#373F51" size="large"></ActivityIndicator>
          </View>
        ) : (
          <View>
            <Card containerStyle={styles.card}>
              <OutlinedTextField
                label="Sujet de la réunion"
                baseColor="#a54f79"
                tintColor="#373F51"
                fontSize={20}
                onChangeText={(sujet) => this.setState({ sujet })}
              />
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
                buttonStyle={styles.date_btn}
                titleStyle={{ color: "white" }}
              />
              <DateTimePickerModal
                headerTextIOS="Sélectionnez une date"
                isVisible={this.state.isDatePickerVisible}
                mode="date"
                date={today}
                minimumDate={today}
                onConfirm={handleConfirmDate}
                onCancel={() => this.setDatePickerVisibility(false)}
                locale="fr-FR"
                cancelTextIOS="Annuler"
                confirmTextIOS="Confirmer"
              />
              {this.state.selectedDate ? (
                <Text style={styles.picked_date_time_text}>
                  {moment(this.state.selectedDate, moment.defaultFormat).format(
                    "D MMMM YYYY"
                  )}
                </Text>
              ) : (
                <Text style={styles.not_picked_date_time_text}>
                  Aucune date sélectionnée
                </Text>
              )}
              <Button
                title="Sélectionner une heure"
                icon={
                  <Icon
                    name="access-time"
                    size={20}
                    color="white"
                    type="material"
                  />
                }
                type="clear"
                onPress={() => this.setTimePickerVisibility(true)}
                buttonStyle={styles.date_btn}
                titleStyle={{ color: "white" }}
              />
              <DateTimePickerModal
                headerTextIOS="Sélectionnez une heure"
                isVisible={this.state.isTimePickerVisible}
                mode="time"
                date={today}
                onConfirm={handleConfirmTime}
                onCancel={() => this.setTimePickerVisibility(false)}
                locale="fr-FR"
                cancelTextIOS="Annuler"
                confirmTextIOS="Confirmer"
              />
              {this.state.selectedTime ? (
                <Text style={styles.picked_date_time_text}>
                  {this.state.selectedTime}
                </Text>
              ) : (
                <Text style={styles.not_picked_date_time_text}>
                  Aucune heure sélectionnée
                </Text>
              )}
              <Dropdown
                label="Sélectionner une salle"
                data={salles}
                fontSize={20}
                baseColor="#a54f79"
                selectedItemColor="#373F51"
                itemColor="#aaa"
                onChangeText={(_, id) => this.setState({ salle: id + 1 })}
              />
              <TagInput
                label="Participants (Appuyez sur espace pour séparer les emails)"
                placeholder="emails... (au moins 3)"
                updateState={this.updateTagState}
                tags={this.state.tags}
                leftElement={
                  <Icon name="email" type="entypo" color="#a54f79" size={16} />
                }
                labelStyle={styles.tagLabel}
                inputStyle={styles.inputText}
                inputContainerStyle={styles.inputContainer}
                tagStyle={styles.tag}
                tagTextStyle={styles.tagText}
                keyboardType="email-address"
                textContentType="emailAddress"
                placeholderTextColor="#aaa"
              />
              {this.state.addLoading ? (
                <ActivityIndicator size="large" />
              ) : (
                <View>
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
                    onPress={() => this.onSubmit()}
                  />
                  <Text style={styles.errorText}>{this.state.errorText}</Text>
                  {this.state.heuresPrises.length > 0 ? (
                    <View>
                      <Text style={styles.errorText}>
                        Voici les heures prises :
                      </Text>
                      {this.heuresPrises()}
                    </View>
                  ) : null}
                </View>
              )}
            </Card>
          </View>
        )}
      </LinearGradient>
    );
  }
}

const styles = StyleSheet.create({
  main_container: {
    flex: 1,
    padding: 15,
  },
  preloading_container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    backgroundColor: "#C4E0F9",
    borderRadius: 3,
    margin: 0,
  },
  date_btn: {
    backgroundColor: "#373F51",
    marginHorizontal: 7.5,
  },
  picked_date_time_text: {
    fontSize: 20,
    color: "#373F51",
    fontWeight: "bold",
    textDecorationStyle: "double",
    textDecorationColor: "#a54f79",
    textAlign: "center",
  },
  not_picked_date_time_text: {
    fontSize: 16,
    color: "#a54f79",
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: "red",
    fontWeight: "bold",
    textAlign: "center",
  },
  tag: { backgroundColor: "white", borderColor: "#a54f79" },
  tagText: { color: "#a54f79" },
  tagLabel: { color: "#a54f79", fontSize: 16 },
  inputText: { color: "#373F51", fontSize: 20 },
  inputContainer: {
    borderWidth: 1,
    borderColor: "#373F51",
    borderRadius: 5,
    marginTop: 7.5,
  },
});
