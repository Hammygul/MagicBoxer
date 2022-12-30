import React, { useState, Component } from "react";
import {
  Alert,
  Button,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
  Image,
} from "react-native";
import { Form, Row } from "native-base";
import { Keyboard } from "react-native";
import BackButton from "../components/BackButton";
import Background from "../components/Background";
import { theme } from "../core/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import { ThemeProvider } from "react-native-paper";

export default class FormPage extends React.Component {
  static ItemDetailsModal = (props) => {
    return (
      <ThemeProvider>
        <Modal visible={props.visible} animationType="slide">
          <View style={styles.modalContent}>
            <Text>Item: {props.item.itemName}</Text>
            <Text>Width: {props.item.itemWidth}</Text>
            <Text>Height: {props.item.itemHeight}</Text>
            <Text>Length: {props.item.itemLength}</Text>
            <Button
              style={styles.backButton}
              onPress={props.closeModal}
              title="Close Modal"
            />
          </View>
        </Modal>
      </ThemeProvider>
    );
  };

  static ItemDetailsName = (props) => {
    return (
      <View>
        <Text>Item: {props.item.itemName}</Text>
      </View>
    );
  };
  constructor(props) {
    super(props);
    this.state = {
      itemName: "",
      itemWidth: 0,
      itemHeight: 0,
      itemLength: 0,
      items: [],
      showDetails: false,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.resetForm = this.resetForm.bind(this);
    this.handleVisualize = this.handleVisualize.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }
  resetForm = () => {
    this.setState({
      itemName: "",
      itemWidth: "",
      itemHeight: "",
      itemLength: "",
    });
  };

  handleChange = (itemName) => {
    this.setState({ itemName });
  };
  _storeData = async () => {
    try {
      await AsyncStorage.setItem("itemList", JSON.stringify(this.state.items));
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "An error occurred while storing the item list");
    }
  };

  handleVisualize = async (e) => {
    // Retrieve the item list from AsyncStorage
    AsyncStorage.getItem("itemList")
      .then((itemListString) => {
        let itemList;
        if (itemListString) {
          itemList = JSON.parse(itemListString);
        } else {
          itemList = [];
        }

        alert(JSON.stringify(itemList));
      })
      .catch((error) => {
        // handle error
        console.error(error);
      });
  };

  handleSubmit = (e) => {
    alert("An item was submitted: " + this.state.itemName);
    if (
      this.state.itemLength === "" ||
      this.state.itemWidth === "" ||
      this.state.itemHeight === "" ||
      this.state.itemName === ""
    ) {
      Alert.alert(
        "Error",
        "Item name, length ,width, and height cannot be empty."
      );
      return;
    }
    if (
      isNaN(this.state.itemLength) ||
      isNaN(this.state.itemWidth) ||
      isNaN(this.state.itemHeight)
    ) {
      // Display an error message
      Alert.alert(
        "Error",
        "Item length, width, and height must be numeric values."
      );
      // prevent the form from being submitted
      return;
    }

    this._storeData(); // Store  the updated items array in AsyncStorageß
    this.setState((prevState) => ({
      items: [
        ...prevState.items,
        {
          itemName: this.state.itemName,
          itemWidth: this.state.itemWidth,
          itemHeight: this.state.itemHeight,
          itemLength: this.state.itemLength,
        },
      ],
    }));

    alert(`Number of items submitted so far: ${this.state.items.length + 1}`);
    this.resetForm();
    Keyboard.dismiss();
  };
  selectItem = (item) => {
    this.setState({ selectedItem: item });
  };

  closeModal = () => {
    this.setState({ showDetails: false });
  };

  render() {
    return (
      // <Background>

      <View style={styles.container}>
        {/* <BackButton goBack={() => {navigation.navigate('Login Screen')}}/> */}
        <Form onSubmit={this.handleSubmit}>
          <Text style={styles.label}>Item Name:</Text>
          <TextInput
            style={styles.input}
            value={this.state.itemName}
            onChangeText={this.handleChange}
          />
          <Text style={styles.label}>Width:</Text>
          <TextInput
            style={styles.input}
            value={this.state.itemWidth}
            onChangeText={(text) => this.setState({ itemWidth: text })}
            keyboardType="numeric"
          />
          <Text style={styles.label}>Height:</Text>
          <TextInput
            style={styles.input}
            value={this.state.itemHeight}
            onChangeText={(text) => this.setState({ itemHeight: text })}
            keyboardType="numeric"
          />
          <Text style={styles.label}>Length:</Text>
          <TextInput
            style={styles.input}
            value={this.state.itemLength}
            onChangeText={(text) => this.setState({ itemLength: text })}
            keyboardType="numeric"
          />
          <View style={styles.buttonContainer}>
            <Button
              block
              style={styles.submitButton}
              onPress={() => {
                this.handleSubmit();
              }}
              title="Submit"
            >
              <Text>Submit</Text>
            </Button>
            <Button
              block
              style={styles.visualizeButton}
              onPress={() => {
                this.handleVisualize();
              }}
              title="Visualize"
            >
              <Text>Visualize</Text>
            </Button>
          </View>
          <ThemeProvider>
            <View style={styles.itemBorder}>
              {this.state.items.map((item, index) => (
                <Button
                  key={index}
                  onPress={() =>
                    this.setState({ showDetails: true, selectedItem: item })
                  }
                  title={item.itemName}
                />
              ))}
              {this.state.showDetails && (
                <FormPage.ItemDetailsModal
                  visible={this.state.showDetails}
                  item={this.state.selectedItem}
                  closeModal={this.closeModal}
                />
              )}
            </View>
          </ThemeProvider>
        </Form>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    marginTop: 20,
    fontWeight: "bold",
    color: "#1C6EA4",
  },
  input: {
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    marginTop: 10,
    padding: 10,
    fontSize: 14,
    borderRadius: 4,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  submitButton: {
    flex: 1,
    marginRight: 5,
  },
  visualizeButton: {
    flex: 1,
    marginLeft: 5,
  },
  itemBorder: {
    borderWidth: "2px",
    borderStyle: "solid",
    borderColor: "#1C6EA4",
  },
  modalContent: {
    backgroundColor: "red",
    fontSize: 20,
    alignItems: "center",
    justifyContent: "flex-start",
    flexDirection: "row",
    flex: 1,
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20,
    padding: 10,
    zIndex: 10,
  },
});
