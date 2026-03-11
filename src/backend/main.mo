import Nat "mo:core/Nat";
import Array "mo:core/Array";
import Text "mo:core/Text";



actor {
  type Asset = {
    id : Nat;
    macId : Text;
    serviceTag : Text;
    assetName : Text;
    category : Text;
    department : Text;
    vendor : Text;
    status : Text;
    purchaseDate : Text;
    lastServiceDate : Text;
    notes : Text;
  };

  stable var assets : [Asset] = [];
  stable var nextId = 1;

  stable var categories : [Text] = ["Laptop", "Desktop", "Monitor"];
  stable var departments : [Text] = ["IT", "Finance", "HR"];
  stable var vendors : [Text] = ["Dell", "HP", "Lenovo"];
  stable var statuses : [Text] = ["Active", "Inactive", "Retired"];

  public shared ({ caller }) func addAsset(
    macId : Text,
    serviceTag : Text,
    assetName : Text,
    category : Text,
    department : Text,
    vendor : Text,
    status : Text,
    purchaseDate : Text,
    lastServiceDate : Text,
    notes : Text,
  ) : async Nat {
    let id = nextId;
    nextId += 1;

    let asset = {
      id;
      macId;
      serviceTag;
      assetName;
      category;
      department;
      vendor;
      status;
      purchaseDate;
      lastServiceDate;
      notes;
    };

    assets := assets.concat([asset]);
    id;
  };

  public shared ({ caller }) func updateAsset(
    id : Nat,
    macId : Text,
    serviceTag : Text,
    assetName : Text,
    category : Text,
    department : Text,
    vendor : Text,
    status : Text,
    purchaseDate : Text,
    lastServiceDate : Text,
    notes : Text,
  ) : async { #ok : (); #err : Text } {
    let assetsCopy = assets;
    var found = false;
    let updatedAssets = assetsCopy.map(
      func(asset) {
        if (asset.id == id) {
          found := true;
          {
            id;
            macId;
            serviceTag;
            assetName;
            category;
            department;
            vendor;
            status;
            purchaseDate;
            lastServiceDate;
            notes;
          };
        } else { asset };
      }
    );
    assets := updatedAssets;
    if (found) { #ok(()) } else {
      #err("Asset not found");
    };
  };

  public query ({ caller }) func getAsset(id : Nat) : async ?Asset {
    assets.find(func(asset) { asset.id == id });
  };

  public query ({ caller }) func getAssets() : async [Asset] {
    assets;
  };

  public shared ({ caller }) func deleteAsset(id : Nat) : async { #ok : (); #err : Text } {
    switch (assets.find(func(asset) { asset.id == id })) {
      case (null) { #err("Asset not found") };
      case (?_) {
        assets := assets.filter(
          func(asset) {
            asset.id != id;
          }
        );
        #ok(());
      };
    };
  };

  public query ({ caller }) func getOptions(fieldType : Text) : async [Text] {
    switch (fieldType) {
      case ("category") { categories };
      case ("department") { departments };
      case ("vendor") { vendors };
      case ("status") { statuses };
      case (_) { [] };
    };
  };

  public shared ({ caller }) func addOption(fieldType : Text, value : Text) : async { #ok : (); #err : Text } {
    let array = switch (fieldType) {
      case ("category") { categories };
      case ("department") { departments };
      case ("vendor") { vendors };
      case ("status") { statuses };
      case (_) { return #err("Invalid field type") };
    };

    if (array.find(func(item) { item == value }) != null) {
      return #err("Option already exists");
    };

    switch (fieldType) {
      case ("category") { categories := array.concat([value]) };
      case ("department") { departments := array.concat([value]) };
      case ("vendor") { vendors := array.concat([value]) };
      case ("status") { statuses := array.concat([value]) };
      case (_) {};
    };
    #ok(());
  };

  public shared ({ caller }) func removeOption(fieldType : Text, value : Text) : async { #ok : (); #err : Text } {
    let array = switch (fieldType) {
      case ("category") { categories };
      case ("department") { departments };
      case ("vendor") { vendors };
      case ("status") { statuses };
      case (_) { return #err("Invalid field type") };
    };

    if (array.find(func(item) { item == value }) == null) {
      return #err("Option does not exist");
    };

    switch (fieldType) {
      case ("category") { categories := array.filter(func(item) { item != value }) };
      case ("department") { departments := array.filter(func(item) { item != value }) };
      case ("vendor") { vendors := array.filter(func(item) { item != value }) };
      case ("status") { statuses := array.filter(func(item) { item != value }) };
      case (_) {};
    };
    #ok(());
  };

  public shared ({ caller }) func updateOption(fieldType : Text, oldValue : Text, newValue : Text) : async { #ok : (); #err : Text } {
    let array = switch (fieldType) {
      case ("category") { categories };
      case ("department") { departments };
      case ("vendor") { vendors };
      case ("status") { statuses };
      case (_) { return #err("Invalid field type") };
    };

    if (array.find(func(item) { item == oldValue }) == null) {
      return #err("Old value does not exist");
    };

    if (array.find(func(item) { item == newValue }) != null) {
      return #err("New value already exists");
    };

    switch (fieldType) {
      case ("category") {
        categories := array.map(func(item) { if (item == oldValue) { newValue } else { item } });
      };
      case ("department") {
        departments := array.map(func(item) { if (item == oldValue) { newValue } else { item } });
      };
      case ("vendor") {
        vendors := array.map(func(item) { if (item == oldValue) { newValue } else { item } });
      };
      case ("status") {
        statuses := array.map(func(item) { if (item == oldValue) { newValue } else { item } });
      };
      case (_) {};
    };
    #ok(());
  };
};
