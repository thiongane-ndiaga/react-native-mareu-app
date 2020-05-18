import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Card, Divider, Button, Icon } from "react-native-elements";
import moment from "moment"; // Pour un bon formattage des dates et heures
import "moment/locale/fr";
import firebase from "../firebaseConfig";

export default class ReunionItem extends React.Component {
  constructor(props) {
    super(props);
    this.reunion = props.reunion.item;
  }
  deleteReunion() {
    const id = this.reunion.id;
    const dbRef = firebase.firestore().collection("reunions").doc(id);
    dbRef.delete().then((res) => console.log("deleted"));
  }
  render() {
    const reunion = this.reunion;
    moment.locale("fr"); // Pour mettre la date et l'heure en francais
    moment.defaultFormat = "DD/MM/YYYY HH:mm";
    var reuDateTime = moment(
      reunion.date + " " + reunion.heure,
      moment.defaultFormat
    );
    var jRestants;

    if (reuDateTime.diff(moment(), "days") == 0) {
      jRestants = "aujourd'hui";
    } else {
      jRestants = reuDateTime.fromNow();
    }

    return (
      <Card
        title={reunion.sujet}
        titleStyle={styles.card_title}
        dividerStyle={{}}
        titleNumberOfLines={1}
        containerStyle={styles.card}
        dividerStyle={{ backgroundColor: "#373F51", height: 1 }}
      >
        <View style={styles.card_content_container}>
          <View style={styles.date_heure_container}>
            <Text style={styles.fromNow_text}>{jRestants}</Text>
            <Text style={styles.date_heure_text}>
              {reuDateTime.format("dddd")}
            </Text>
            <Text style={styles.date_heure_text}>
              {reuDateTime.format("D MMMM")}
            </Text>
            <Text style={styles.date_heure_text}>
              {reuDateTime.format("HH:mm")}
            </Text>
          </View>
          <View style={styles.salle_container}>
            <Text style={styles.salle_title}>Salle</Text>
            <Text style={styles.salle_text}>{reunion.salle}</Text>
          </View>
        </View>
        <Divider style={styles.divider} />
        <View style={styles.participants_container}>
          <Text style={styles.participants_title}>Participants</Text>
          {reunion.participants.map((email) => (
            <Text style={styles.participants_item}>{email}</Text>
          ))}
        </View>
        <Divider style={styles.divider} />
        <View style={styles.options_container}>
          <Button
            title="Supprimer"
            icon={
              <Icon
                name="delete"
                color="white"
                size={20}
                type="material-community"
              />
            }
            buttonStyle={styles.options_buttons}
            onPress={() => this.deleteReunion()}
          />
        </View>
      </Card>
    );
  }
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#C4E0F9",
    borderRadius: 3,
  },
  card_content_container: {
    flexDirection: "row",
  },
  date_heure_container: {
    flex: 1,
  },
  salle_container: {
    flex: 1,
    alignItems: "center",
  },
  card_title: {
    textTransform: "uppercase",
  },
  fromNow_text: {
    fontSize: 20,
    fontWeight: "bold",
  },
  date_heure_text: {
    fontSize: 17,
    textTransform: "capitalize",
  },
  salle_title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  salle_text: {
    fontSize: 50,
    fontWeight: "bold",
  },
  options_container: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  divider: {
    backgroundColor: "#373F51",
    height: 1,
    marginVertical: 10,
  },
  participants_title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
  },
  participants_item: { fontSize: 17, fontStyle: "italic", color: "#a54f79" },
  options_buttons: { backgroundColor: "#373F51", marginHorizontal: 7.5 },
});
