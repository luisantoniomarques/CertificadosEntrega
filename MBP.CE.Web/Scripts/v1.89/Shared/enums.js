
var VehicleType = {
    New: 291110000,
    Used: 291110001
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
    Integer: "int32"
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
    RC: 291110009,
    RAC: 291110010,
    F: 291110011
};

var CertificateType = {
    New: false,
    StarSelection: true
};

var CertificateStatus = {
    Archived: 291110000,
    Available: 291110001,
    Assigned: 291110002,
    Delivered: 291110003,
    Closed: 291110007
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
    Edit: 1
};

var EntityType = {
    Private: 291110000,
    Enterprise: 291110001
};

var EntityState = {
    Unchanged: 0,
    Created: 1,
    Updated: 2,
    Deleted: 3
};

var CookieName = {
    SearchVehicle: "vehicle-search-cookie",
    SearchCorrectionRequest: "corrections-search-cookie",
    SelectedVehicle: "selected-vehicle-cookie"
};

var UserPermission = {
    Administator: "CE Administrator",
    Dealer: "CE Dealer User",
    DealerChief: "CE Dealer Chief",

    CertificateNew: "CE Novo",
    CertificateStarSelection: "CE StarSelection",
    CertificateUsed: "CE Used",
    CertificateMBCertified: "CE MBCertified",
    CertificateUsed1: "CE Used1"
};

var CreateCertificateType = {
    StarSelection: 291110000,
    Used: 291110001,
    Used1: 291110002,
    WithoutLicensePlate: 291110003,
    New: 291110004,
    MBCertified: 291110005,
    MBCertified4: 291110006
}

var Chassis_Prefix_MBVans = {
    MercedesProAdapter: "WDF639;WDF447;WDB906;",
    MercedesProConnect: "WDB907;WDB910;"
}