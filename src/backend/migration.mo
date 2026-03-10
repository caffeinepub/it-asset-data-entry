import Map "mo:core/Map";
import Nat "mo:core/Nat";

module {
  type OldITAsset = {
    id : Nat;
    name : Text;
    category : Category;
    serialNumber : Text;
    status : Status;
    location : Text;
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

  type OldActor = {
    assets : Map.Map<Nat, OldITAsset>;
    nextId : Nat;
  };

  type NewITAsset = {
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

  type NewActor = {
    assets : Map.Map<Nat, NewITAsset>;
    nextId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let newAssets = old.assets.map<Nat, OldITAsset, NewITAsset>(
      func(_id, oldAsset) {
        {
          oldAsset with
          macId = " ";
          serviceTag = " ";
          assignedDepartment = #Other;
          lastServiceDate = " ";
          purchaseDate = " ";
          purchaseVendor = " ";
        };
      }
    );
    { assets = newAssets; nextId = old.nextId };
  };
};
