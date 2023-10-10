
var VehicleType = {
    New: 291110000,
    StarSelection: 291110001
};

var CertificateEntityType = {
    Owner: 291110000,
    User: 291110001,
    Contact: 291110002,
    Lessor: 291110003,
    Lessee: 291110004
};

var LicensePlateType = {
    Exportation: 291110000,
    Diplomatic: 291110001,
    Military: 291110002,
    Regular: 291110003
};

var Brand = {
    Mercedes: "mercedes-benz",
    Smart: "smart"
};

var FieldType = {
    OptionSet: "optionset",
    Guid: "guid",
    DateTime: "DateTime",
    String: "string",
    Boolean: "boolean",
    Integer: "int32",
};

var DeliveryType = {
    PP: 291110000,
    ELR_PP: 291110001,
    ELR_E: 291110002,
    ELR_PT: 291110003,
    E: 291110004,
    PT: 291110005,
    SE: 291110006,
    DE: 291110007,
    WithoutLicense: 291110008,
    PF: 291110009
};

var CertificateStatus = {
    Archived: 291110000,
    Available: 291110001,
    Assigned: 291110002,
    Delivered: 291110003,
    Closed: 291110006
};

var AddressType = {
    OldAddress: 291110000,
    Company: 291110001,
    Billing: 291110002,
    Holidays : 291110003,
    Home: 291110004
};

var ContactType = {
    Email: 291110000,
    Phone: 291110001,
    Fax: 291110002
};

var PaymentType = {
    LongTermRental: 291110000,
    Financing: 291110001,
    Cash: 291110002
};

var CorrectionRequestType = {
    DataCleaning: 291110000
};

var Menu = {
    Add: 0,
    Edit: 1,
};

var EntityType = {
    Private: 291110000,
    Enterprise: 291110001
};

var EntityState = {
    Unchanged: 0,
    Created: 1,
    Updated: 2,
    Deleted: 3,
};

var CookieName = {
    SearchVehicle: "vehicle-search-cookie",
    SearchCorrectionRequest: "corrections-search-cookie",
    SelectedVehicle: "selected-vehicle-cookie"
};

var UserPermission = {
    Administator: "CE Administrator",
    ChiefUsed: "CE Chief Used",
    Dealer: "CE Dealer User",
    DealerChief: "CE Dealer Chief"
};
