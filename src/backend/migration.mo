import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";

module {
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

  type OldActor = {
    assets : Map.Map<Nat, Asset>;
    categories : Map.Map<Text, ()>;
    departments : Map.Map<Text, ()>;
    vendors : Map.Map<Text, ()>;
    statuses : Map.Map<Text, ()>;
    nextId : Nat;
  };

  type NewActor = {
    assets : [Asset];
    categories : [Text];
    departments : [Text];
    vendors : [Text];
    statuses : [Text];
    nextId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    {
      assets = old.assets.values().toArray();
      categories = old.categories.keys().toArray();
      departments = old.departments.keys().toArray();
      vendors = old.vendors.keys().toArray();
      statuses = old.statuses.keys().toArray();
      nextId = old.nextId;
    };
  };
};
