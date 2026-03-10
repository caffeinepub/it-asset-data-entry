import Nat "mo:core/Nat";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";



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

  type UpdateAssetParams = {
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

  public func addAsset(
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

  public func updateAsset(assetParams : UpdateAssetParams) : async {
    #ok : ();
    #err : Text;
  } {
    switch (assets.get(assetParams.id)) {
      case (null) { #err("Asset not found") };
      case (?_) {
        let updatedAsset : ITAsset = {
          id = assetParams.id;
          name = assetParams.name;
          category = assetParams.category;
          serialNumber = assetParams.serialNumber;
          macId = assetParams.macId;
          serviceTag = assetParams.serviceTag;
          status = assetParams.status;
          assignedDepartment = assetParams.assignedDepartment;
          location = assetParams.location;
          lastServiceDate = assetParams.lastServiceDate;
          purchaseDate = assetParams.purchaseDate;
          purchaseVendor = assetParams.purchaseVendor;
          notes = assetParams.notes;
        };
        assets.add(assetParams.id, updatedAsset);
        #ok(());
      };
    };
  };

  public query func getAsset(id : Nat) : async ITAsset {
    switch (assets.get(id)) {
      case (null) { Runtime.trap("Asset not found") };
      case (?asset) { asset };
    };
  };

  public query func getAllAssets() : async [ITAsset] {
    assets.values().toArray();
  };

  public query func getAssetName(id : Nat) : async ?Text {
    switch (assets.get(id)) {
      case (null) { null };
      case (?asset) { ?asset.name };
    };
  };

  public func deleteAsset(id : Nat) : async () {
    if (not assets.containsKey(id)) {
      Runtime.trap("Asset not found");
    };
    assets.remove(id);
  };
};
