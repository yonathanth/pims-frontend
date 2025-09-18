import { useState } from "react";
import StepLayout from "../layouts/StepLayout";
import {
  TextInput,
  Select,
  SelectItem,
  InlineNotification
} from "@carbon/react";

export default function Step2() {
  const [pharmacyName, setPharmacyName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [city, setCity] = useState("");
  const [subCity, setSubCity] = useState("");
  const [wereda, setWereda] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Store form data in localStorage for StepLayout to access
  const handleFieldChange = () => {
    const formData = {
      pharmacyName,
      licenseNumber,
      city,
      subCity,
      wereda,
      zipCode,
      phone,
      address
    };
    localStorage.setItem('onboarding_step2', JSON.stringify(formData));
  };

  return (
    <StepLayout currentStep={1}>
      <div className="flex flex-col mt-6 px-6 py-8">
        <div>
          <h1 className="text-4xl font-extralight mb-3">Pharmacy Setup</h1>
          <p className="mb-8 text-xl font-extralight">Tell us a few things about your pharmacy</p>
        </div>

        {error && (
          <InlineNotification
            kind="error"
            title="Error"
            subtitle={error}
            onCloseButtonClick={() => setError(null)}
            className="mb-6"
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInput 
            id="pharmacy-name" 
            labelText="Pharmacy name" 
            placeholder="Enter Pharmacy name" 
            size="lg" 
            value={pharmacyName}
            onChange={(e) => { setPharmacyName(e.target.value); handleFieldChange(); }}
          />
          <TextInput 
            id="license-number" 
            labelText="License Number" 
            placeholder="Enter License Number" 
            size="lg" 
            value={licenseNumber}
            onChange={(e) => { setLicenseNumber(e.target.value); handleFieldChange(); }}
          />

          <Select 
            id="city" 
            labelText="City" 
            size="lg"
            value={city}
            onChange={(e) => { setCity(e.target.value); handleFieldChange(); }}
          >
            <SelectItem value="" text="Select city" />
            <SelectItem value="addis-ababa" text="Addis Ababa" />
            <SelectItem value="dire-dawa" text="Dire Dawa" />
            <SelectItem value="mekelle" text="Mekelle" />
            <SelectItem value="gondar" text="Gondar" />
            <SelectItem value="hawassa" text="Hawassa" />
            <SelectItem value="bahir-dar" text="Bahir Dar" />
          </Select>
          
          <Select 
            id="sub-city" 
            labelText="Sub-city" 
            size="lg"
            value={subCity}
            onChange={(e) => { setSubCity(e.target.value); handleFieldChange(); }}
          >
            <SelectItem value="" text="Select sub-city" />
            {city === "addis-ababa" && (
              <>
                <SelectItem value="arada" text="Arada" />
                <SelectItem value="addis-ketema" text="Addis Ketema" />
                <SelectItem value="lideta" text="Lideta" />
                <SelectItem value="kirkos" text="Kirkos" />
                <SelectItem value="yeka" text="Yeka" />
                <SelectItem value="nifas-silk-lafto" text="Nifas Silk-Lafto" />
                <SelectItem value="kolfe-keranio" text="Kolfe Keranio" />
                <SelectItem value="gulele" text="Gulele" />
                <SelectItem value="akaky-kaliti" text="Akaky Kaliti" />
                <SelectItem value="bole" text="Bole" />
                <SelectItem value="Lemi-kura" text="Lemi Kura" />
              </>
            )}
          </Select>

          <Select 
            id="wereda" 
            labelText="Wereda" 
            size="lg"
            value={wereda}
            onChange={(e) => { setWereda(e.target.value); handleFieldChange(); }}
          >
            <SelectItem value="" text="Select Wereda" />
            <SelectItem value="01" text="Wereda 01" />
            <SelectItem value="02" text="Wereda 02" />
            <SelectItem value="03" text="Wereda 03" />
            <SelectItem value="04" text="Wereda 04" />
            <SelectItem value="05" text="Wereda 05" />
          </Select>
          
          <TextInput 
            id="zip-code" 
            labelText="Zip Code" 
            placeholder="Enter zip code" 
            size="lg" 
            value={zipCode}
            onChange={(e) => { setZipCode(e.target.value); handleFieldChange(); }}
          />

          <TextInput 
            id="phone" 
            labelText="Phone Number" 
            placeholder="Enter Phone Number" 
            className="md:col-span-2" 
            size="lg" 
            value={phone}
            onChange={(e) => { setPhone(e.target.value); handleFieldChange(); }}
          />
          
          <TextInput 
            id="address" 
            labelText="Physical Address" 
            placeholder="Enter street address" 
            className="md:col-span-2" 
            size="lg" 
            value={address}
            onChange={(e) => { setAddress(e.target.value); handleFieldChange(); }}
          />
        </div>
      </div>
    </StepLayout>
  );
}
