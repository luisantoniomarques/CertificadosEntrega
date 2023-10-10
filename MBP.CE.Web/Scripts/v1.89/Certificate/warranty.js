var Warranty = new function () {

    var warrantyDuration = {
        New: 2,
        StarSelection: 2,
        MBCertified: 2,
        MBCertified4: 4,
        Used1: 1
    }


    function calculateWarrantyEndDate(vehicle, licenseIssueDate, deliveryDate) {
        var warrantyStartDate, warrantyEndDate, warrantyPeriod;

        var recalculateWarranty =
            vehicle != null &&
            (vehicle.certificateType === CreateCertificateType.StarSelection || vehicle.certificateType === CreateCertificateType.MBCertified || vehicle.certificateType === CreateCertificateType.MBCertified4 || vehicle.certificateType === CreateCertificateType.Used1 || (vehicle.certificate == null || vehicle.certificate != null && vehicle.certificate.number == null)) &&
            vehicle.certificateType !== CreateCertificateType.Used;

        if (recalculateWarranty) {
            deliveryDate = (deliveryDate instanceof Date ? deliveryDate : null);

            var isStarSelection = (vehicle.certificateType === CreateCertificateType.StarSelection);
            var isMBCertified = (vehicle.certificateType === CreateCertificateType.MBCertified);  //js
            var isMBCertified4 = (vehicle.certificateType === CreateCertificateType.MBCertified4);  //js
            var isNew = (vehicle.certificateType === CreateCertificateType.New);
            var isUsed1 = (vehicle.certificateType === CreateCertificateType.Used1); //js

            if (isStarSelection) {
                warrantyPeriod = warrantyDuration.StarSelection;
                warrantyStartDate = (deliveryDate instanceof Date ? deliveryDate : null);
            }
            else if (isMBCertified) {
                warrantyPeriod = warrantyDuration.MBCertified;
                warrantyStartDate = (deliveryDate instanceof Date ? deliveryDate : null);   //js
            }
            else if (isMBCertified4) {
                warrantyPeriod = warrantyDuration.MBCertified4;
                warrantyStartDate = (deliveryDate instanceof Date ? deliveryDate : null);   //js
            }
            else if (isUsed1) {
                warrantyPeriod = warrantyDuration.Used1;
                warrantyStartDate = (deliveryDate instanceof Date ? deliveryDate : null);   //js
            }
            else if (isNew) {
                warrantyPeriod = warrantyDuration.New;
                warrantyStartDate = (licenseIssueDate instanceof Date ? licenseIssueDate : null);
            }
            else {
                warrantyPeriod = warrantyDuration.New;
                warrantyStartDate = (licenseIssueDate instanceof Date ? licenseIssueDate : null);

                if (deliveryDate != null) {
                    warrantyStartDate = (warrantyStartDate == null ? deliveryDate : (deliveryDate < warrantyStartDate ? deliveryDate : warrantyStartDate));
                }
            }

            warrantyEndDate = null;
            if (warrantyStartDate != null) {
                warrantyEndDate = new Date(warrantyStartDate);
                warrantyEndDate.setFullYear(warrantyEndDate.getFullYear() + warrantyPeriod);
                warrantyEndDate.setDate(warrantyEndDate.getDate() - 1);
            }

            return {
                warrantyStartDate: warrantyStartDate,
                warrantyEndDate: warrantyEndDate
            };
        }

        return {
            warrantyStartDate: null,
            warrantyEndDate: null
        };
    }

    this.calculateWarrantyEndDate = calculateWarrantyEndDate;
}