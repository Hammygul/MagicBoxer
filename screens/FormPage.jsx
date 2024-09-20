// FormPage.js
import React, { Component } from "react";
import {
  Alert,
  Text,
  TextInput,
  View,
  Modal,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Form } from "native-base";
import { Dropdown } from "react-native-element-dropdown";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { generateUUID } from "three/src/math/MathUtils";
import { pack, createDisplay } from "../packing_algo/packing";
import styles from "../components/Styles1";
import AntDesign from "@expo/vector-icons/AntDesign";

var Buffer = require("@craftzdog/react-native-buffer").Buffer;

const carrierData = [
  { label: "UPS", value: "UPS" },
  { label: "USPS", value: "USPS" },
  { label: "FedEx", value: "FedEx" },
  { label: "No Carrier", value: "No Carrier" },
];
// Define colors for buttons that open the ItemDetailsModal
const itemButtonColors = [
  "#3B5998", // Deep Blue
  "#008080", // Teal
  "#556B2F", // Dark Olive Green
  "#8B0000", // Dark Red
  "#FF8C00", // Dark Orange
  "#6A0DAD", // Purple
  "#008B8B", // Dark Cyan
];

export default class FormPage extends Component {
  static ItemDetailsModal = (props) => {
    return (
      <View style={styles.centeredView}>
        <Modal visible={props.visible} animationType="slide" transparent={true}>
          <View style={styles.centeredView}>
            <View style={styles.modalContent}>
              <Text style={styles.label}>Item Name: {props.item.itemName}</Text>
              <Text style={styles.label}>Length: {props.item.itemLength}</Text>
              <Text style={styles.label}>Width: {props.item.itemWidth}</Text>
              <Text style={styles.label}>Height: {props.item.itemHeight}</Text>
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  onPress={() => props.handleDeleteAndClose(props.item)}
                  style={styles.buttonDelete}
                >
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={props.closeModal}
                  style={styles.buttonClose}
                >
                  <Text style={styles.buttonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
      unit: "inches",
      selectedCarrier: "Select Carrier",
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

  handleDeleteAndClose = (itemToDelete) => {
    const updatedItems = this.state.items.filter(
      (item) => item.id !== itemToDelete.id
    );
    this.setState({ items: updatedItems }, async () => {
      try {
        const serializedItems = Buffer.from(
          JSON.stringify(this.state.items)
        ).toString("base64");
        await AsyncStorage.setItem("itemList", serializedItems);
        Alert.alert("Item Deleted");
        this.closeModal();
      } catch (error) {
        Alert.alert("Error deleting item", error.message);
      }
    });
  };

  deleteItem = async (index) => {
    const updatedItems = this.state.items.filter(
      (_, itemIndex) => index !== itemIndex
    );
    this.setState({ items: updatedItems });
    try {
      const serializedItems = Buffer.from(
        JSON.stringify(updatedItems)
      ).toString("base64");
      await AsyncStorage.setItem("itemList", serializedItems);
      Alert.alert("Item Deleted");
    } catch (error) {
      Alert.alert("Error deleting item");
    }
  };

  handleChange = (itemName) => {
    this.setState({ itemName });
  };

  _storeData = async () => {
    try {
      const serializedItems = Buffer.from(
        JSON.stringify(this.state.items)
      ).toString("base64");
      await AsyncStorage.setItem("itemList", serializedItems);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "An error occurred while storing the item list");
    }
  };

  handleVisualize = async () => {
    if (this.state.items.length === 0) {
      Alert.alert("No Items", "Please add at least one item before packing.");
      return;
    }
    try {
      const itemListString = await AsyncStorage.getItem("itemList");
      let itemList = [];
      if (itemListString) {
        const deserializedItems = JSON.parse(
          Buffer.from(itemListString, "base64").toString("utf8")
        );
        itemList = deserializedItems;
      }

      this.setState({ items: itemList }, () => {
        var itemsTotal = [];
        this.state.items.forEach((item) => {
          itemsTotal.push([
            item.itemLength,
            item.itemWidth,
            item.itemHeight,
            item.id,
            item.selectedCarrier,
          ]);
        });
        var packedResult = [];
        console.log("Test Dims:", itemsTotal);
        console.log("Selected", this.state.selectedCarrier);
        packedResult.push(pack(itemsTotal, this.state.selectedCarrier, 0));
        console.log("Packed Result:", packedResult);

        if (packedResult === 0) {
          Alert.alert(
            "Items are too big for a single standard box. Multiple boxed orders have not been implemented yet."
          );
        } else {
          var scale = 10;
          if (
            Math.max(packedResult[0].x, packedResult[0].y, packedResult[0].z) >
            15
          ) {
            scale = 20;
          }
          packedResult.push(createDisplay(packedResult[0], scale));

          var selectedBox = {
            dimensions: [
              packedResult[0].x,
              packedResult[0].y,
              packedResult[0].z,
            ],
            price: packedResult[0].price,
            finalBoxType: packedResult[0].type,
          };

          console.log("selected box:", selectedBox);

          this.props.navigation.navigate("Display3D", {
            box: packedResult[0],
            itemsTotal: packedResult[1],
            selectedBox: selectedBox,
            selectedCarrier: this.state.selectedCarrier,
          });
        }
      });
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "An error occurred while retrieving the item list");
    }
  };

  handleSubmit = (e) => {
    if (this.state.selectedCarrier === "Select Carrier") {
      Alert.alert(
        "Carrier Not Selected",
        "Please select a carrier before adding an item."
      );
      return;
    }
    if (
      this.state.itemLength === "" ||
      this.state.itemWidth === "" ||
      this.state.itemHeight === "" ||
      this.state.itemName === "" ||
      this.state.selectedCarrier === ""
    ) {
      Alert.alert(
        "Error",
        "Item name, length, width, and height cannot be empty."
      );
      return;
    }
    if (
      this.state.itemLength === "0" ||
      this.state.itemWidth === "0" ||
      this.state.itemHeight === "0"
    ) {
      Alert.alert("Error", "Item dimensions cannot be 0.");
      return;
    }

    const length = parseFloat(this.state.itemLength);
    const width = parseFloat(this.state.itemWidth);
    const height = parseFloat(this.state.itemHeight);

    if (isNaN(length) || isNaN(width) || isNaN(height)) {
      Alert.alert(
        "Error",
        "Item length, width, and height must be numeric values."
      );
      return;
    }

    if (
      !Number.isFinite(length) ||
      !Number.isFinite(width) ||
      !Number.isFinite(height)
    ) {
      Alert.alert("Error", "Invalid item dimensions.");
      return;
    }

    const exists = this.state.items.some(
      (item) => item.itemName === this.state.itemName
    );
    if (exists) {
      Alert.alert("Error", "An item with the same name already exists.");
      return;
    }
    const newItem = {
      id: generateUUID(),
      itemName: this.state.itemName,
      itemLength: length,
      itemWidth: width,
      itemHeight: height,
      selectedCarrier: this.state.selectedCarrier,
    };
    this.setState({ items: [...this.state.items, newItem] }, () => {
      this._storeData();
    });

    Alert.alert("Success", "An item was submitted: " + this.state.itemName);
    this.resetForm();
    Keyboard.dismiss();
  };

  selectItem = (item) => {
    this.setState({ selectedItem: item });
  };

  openModal = (item) => {
    this.setState({ showDetails: true, selectedItem: item });
  };

  closeModal = () => {
    this.setState({ showDetails: false, selectedItem: null });
  };

  render() {
    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={styles.container}>
          {/* Input form for adding items */}
          <View style={styles.formContainer}>
            <Form onSubmit={this.handleSubmit}>
              <Text style={styles.label}>Select Carrier:</Text>
              <Dropdown
                style={styles.input}
                data={carrierData}
                labelField="label"
                valueField="value"
                placeholder="Select Carrier"
                value={this.state.selectedCarrier}
                onChange={(item) =>
                  this.setState({ selectedCarrier: item.value })
                }
                renderLeftIcon={() => (
                  <AntDesign
                    style={styles.icon}
                    color="black"
                    name="Safety"
                    size={20}
                  />
                )}
              />
              <Text style={styles.label}>Item Name:</Text>
              <TextInput
                style={styles.input}
                value={this.state.itemName}
                onChangeText={this.handleChange}
                maxLength={10}
                returnKeyType={"next"}
                placeholder="MacBook, Xbox etc"
                placeholderTextColor={"#d3d3d3"}
              />
              <Text style={styles.label}>Length:</Text>
              <TextInput
                style={styles.input}
                value={this.state.itemLength}
                onChangeText={(text) => this.setState({ itemLength: text })}
                keyboardType="numeric"
                placeholder="-- inches"
                placeholderTextColor={"#d3d3d3"}
                maxLength={2}
              />
              <Text style={styles.label}>Width:</Text>
              <TextInput
                style={styles.input}
                value={this.state.itemWidth}
                onChangeText={(text) => this.setState({ itemWidth: text })}
                keyboardType="numeric"
                placeholder="-- inches"
                placeholderTextColor={"#d3d3d3"}
                maxLength={2}
              />
              <Text style={styles.label}>Height:</Text>
              <TextInput
                style={styles.input}
                value={this.state.itemHeight}
                onChangeText={(text) => this.setState({ itemHeight: text })}
                keyboardType="numeric"
                placeholder="-- inches"
                placeholderTextColor={"#d3d3d3"}
                maxLength={2}
              />
              <TouchableOpacity
                style={styles.submitButton}
                onPress={this.handleSubmit}
              >
                <Text style={styles.buttonText}>Add Item</Text>
              </TouchableOpacity>
            </Form>
          </View>

          {/* Items List Container with ScrollView */}
          <ScrollView
            style={styles.itemsContainer}
            contentContainerStyle={styles.itemsList}
          >
            {this.state.items.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.itemButton,
                  {
                    backgroundColor:
                      itemButtonColors[index % itemButtonColors.length],
                  },
                ]}
                onPress={() => this.openModal(item)}
              >
                <Text style={styles.buttonText}>{item.itemName}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Fixed position Pack button */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.visualizeButton}
              onPress={this.handleVisualize}
            >
              <Text style={styles.buttonText}>Pack!</Text>
            </TouchableOpacity>
          </View>

          {/* Modal for item details */}
          {this.state.showDetails && this.state.selectedItem && (
            <FormPage.ItemDetailsModal
              visible={this.state.showDetails}
              item={this.state.selectedItem}
              closeModal={this.closeModal}
              handleDeleteAndClose={this.handleDeleteAndClose}
            />
          )}
        </View>
      </TouchableWithoutFeedback>
    );
  }
}
