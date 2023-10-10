var StarSelection = new function () {
    var starSelectionMercedesAcceptedYears   = 6;
    var starSelectionMercedesAcceptedMileage = 150000;

    var used1MercedesAcceptedYears = 6;
    var used1MercedesAcceptedMileage = 160000;

    var starSelectionSmartAcceptedYears   = 5;
    var starSelectionSmartAcceptedMileage = 100000;

    function validateStarSelectionMileage(brand, mileage) {
        if (brand == null) {
            return false;
        }

        if (isNaN(mileage)) {
            mileage = 0;
        }

        var acceptedMileage = 0;

        switch (brand.toLowerCase()) {
        case Brand.Mercedes:
            acceptedMileage = starSelectionMercedesAcceptedMileage;
            break;

        case Brand.Smart:
            acceptedMileage = starSelectionSmartAcceptedMileage;
            break;
        }

        if (mileage > acceptedMileage) {
            return false;
        }

        return true;
    };

    function validateUsed1Mileage(brand, mileage) {
        if (brand == null) {
            return false;
        }

        if (isNaN(mileage)) {
            mileage = 0;
        }

        var acceptedMileage = 0;

        switch (brand.toLowerCase()) {
            case Brand.Mercedes:
                acceptedMileage = used1MercedesAcceptedMileage;
                break;
        }

        if (mileage > acceptedMileage) {
            return false;
        }

        return true;
    };

    function validateStarSelectionDate(brand, licenseDate) {
        if (brand == null) {
            return false;
        }

        if (!(licenseDate instanceof Date)) {
            licenseDate = jsonWcfDatetimeToJsDate(licenseDate);
            if (!(licenseDate instanceof Date)) {
                return false;
            }
        }

        var today = new Date();
        today.setHours(0, 0, 0, 0);

        var daysPassed = diffDays(licenseDate, today);
        
        var minDate = new Date();
        minDate.setHours(0, 0, 0, 0);

        switch (brand.toLowerCase()) {
            case Brand.Mercedes:
                minDate.setYear(today.getFullYear() - starSelectionMercedesAcceptedYears);
                break;

            case Brand.Smart:
                minDate.setYear(today.getFullYear() - starSelectionSmartAcceptedYears);
                break;
        }
        var acceptedDays = diffDays(minDate, today);

        if (daysPassed > acceptedDays) {
            return false;
        }

            return true;
    };

    function validateUsed1Date(brand, licenseDate) {
        if (brand == null) {
            return false;
        }

        if (!(licenseDate instanceof Date)) {
            licenseDate = jsonWcfDatetimeToJsDate(licenseDate);
            if (!(licenseDate instanceof Date)) {
                return false;
            }
        }

        var today = new Date();
        today.setHours(0, 0, 0, 0);

        var daysPassed = diffDays(licenseDate, today);

        var minDate = new Date();
        minDate.setHours(0, 0, 0, 0);

        switch (brand.toLowerCase()) {
            case Brand.Mercedes:
                minDate.setYear(today.getFullYear() - used1MercedesAcceptedYears);
                break;

        }
        var acceptedDays = diffDays(minDate, today);

        if (daysPassed > acceptedDays) {
            return false;
        }

        return true;
    };

    function validateKomissionStarSelection(komission) {
        if (komission == null || komission.length === 0) {
            return true;
        }

        var acceptedKomissionFirstDigitList = [0, 6];
        var firstDigit = Number(komission[0]);

        return ($.inArray(firstDigit, acceptedKomissionFirstDigitList) !== -1);
    }

    function isValidStarSelection(brand, mileage, licenseDate, komission) {
        return (validateKomissionStarSelection(komission)
                && validateStarSelectionDate(brand, licenseDate)
                && validateStarSelectionMileage(brand, mileage));
    }

    this.validateStarSelectionMileage   = validateStarSelectionMileage;
    this.validateStarSelectionDate      = validateStarSelectionDate;
    this.validateKomissionStarSelection = validateKomissionStarSelection;
    this.isValidStarSelection = isValidStarSelection;
    this.validateUsed1Mileage = validateUsed1Mileage;
    this.validateUsed1Date = validateUsed1Date;
}