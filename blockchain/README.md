# reliability-poc



1) CA Creation
2) cryptomaterial creation
3) Create artifacts
4) Run all services
5) Create Channel
7) Deploy Chaincode



Student: Oratile Leteane
Project: Trusted data management in beef supply chain, case of Botswana


Cattle information
    • Cattleid
    • Breed
    • DoBDate of birth
    • Base_location
    • Deviceid
    • Ownerid
    • ownerName
    • ownerSurname
device information
    • Name/manufacturer
    • Deviceid
    • Calibration_date
    • Calibration_expiry_date


device Data
    • type: GPS/temp
    • Deviceid
    • data:{}
    • deviceMetaData:
    • timestamp
    • cattleId
    • isValid:1

UI
    • Users registration
    • Login
    • Cattle registration
    • Devices registration
    • Device update (should be done by authority organisation users). Updating devices is changing the calibration dates
    • display OF Registered cattle (live cattle for organisation whose user is logged in)
    • Display of devices (to a specific organisation) whose calibration date is expired and those whose expiry date is nearing
    • Updating cattle
    • Cattle ownership transafer
    • Search for cattle (using cattleID)

Functionalities
    • Register cattle to the ledger
    • Register devices (GP and temperature sensors) to the ledger
    • Device calibration date and expiry date are updated every time there is new calibration
    • Devices send data (location and temperature) to the ledger every 10 minutes

Important logic in blockchain smart contracts
Location data form sensors
    • Calibration of the devices sending data should be checked if it is valid. A numerical value of 1 should be issued of the calibration is valid, otherwise the value of 0 is issued
    • Battery level and power consumption – The device will send as part of meta data battery level. The smart contract should check the battery level and issue value of 0 if the power level is below 5%. If the 5% and more, the smart contact should get the previous battery level (from data received in the previous interval) of compute amount of power consumption. If is above normal (more than 1%) then value of 0 is issued, otherwise value of 1 is issued
    • Tempral corelation – computes the distance of coverage using the previous and current latitudes/longitudes coordinates, then check whether the distance of coverage is normal.
        ◦ First Ry (distance of coverage is computed)
        ◦ The previous average distance of coverage (Rx) is subtracted from current distance of coverage (|Ry – Rx|). If there is any deviation (i), then (i) is checked against normal deviations range. If within the range, the deviation is subtracted from 1 (1-i). otherwise, is multiplied by 0.5

Project development phases
Part 1 (registration and display)
    • Cattle and devices registration
    • Cattle update
    • Cattle ownership transfer
    • Cattle data display
    • Devices data display
    • Devices update
    • Cattle search

Part 2 (data trust management)
    • Location and temperature data registration
    • Trust computation