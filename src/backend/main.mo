import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Migration "migration";

(with migration = Migration.run)
actor {
  type ITAsset = {
    id : Nat;
    name : Text;
    category : Category;
    serialNumber : Text;
    macId : Text;
    serviceTag : Text;
    status : Status;
    assignedDepartment : Department;
    location : Text;
    lastServiceDate : Text;
    purchaseDate : Text;
    purchaseVendor : Text;
    notes : Text;
  };

  type Category = {
    #Computer;
    #Monitor;
    #Printer;
    #NetworkDevice;
    #Phone;
    #Peripheral;
    #Software;
    #Other;
  };

  type Status = {
    #Active;
    #Inactive;
    #InRepair;
    #Retired;
  };

  type Department = {
    #IT;
    #Biomedical;
    #Engineering;
    #Accounts;
    #HR;
    #Finance;
    #Administration;
    #Maintenance;
    #Other;
  };

  let assets = Map.empty<Nat, ITAsset>();
  var nextId = 1;

  public shared ({ caller }) func addAsset(
    name : Text,
    category : Category,
    serialNumber : Text,
    macId : Text,
    serviceTag : Text,
    status : Status,
    assignedDepartment : Department,
    location : Text,
    lastServiceDate : Text,
    purchaseDate : Text,
    purchaseVendor : Text,
    notes : Text,
  ) : async Nat {
    let asset : ITAsset = {
      id = nextId;
      name;
      category;
      serialNumber;
      macId;
      serviceTag;
      status;
      assignedDepartment;
      location;
      lastServiceDate;
      purchaseDate;
      purchaseVendor;
      notes;
    };
    assets.add(nextId, asset);
    nextId += 1;
    asset.id;
  };

  public query ({ caller }) func getAsset(id : Nat) : async ITAsset {
    switch (assets.get(id)) {
      case (null) { Runtime.trap("Asset not found") };
      case (?asset) { asset };
    };
  };

  public query ({ caller }) func getAllAssets() : async [ITAsset] {
    assets.values().toArray();
  };

  public query ({ caller }) func getAssetName(id : Nat) : async ?Text {
    switch (assets.get(id)) {
      case (null) { null };
      case (?asset) { ?asset.name };
    };
  };

  public shared ({ caller }) func deleteAsset(id : Nat) : async () {
    if (not assets.containsKey(id)) {
      Runtime.trap("Asset not found");
    };
    assets.remove(id);
  };
};
