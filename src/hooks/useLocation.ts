// hooks/useLocation.ts
import { useState, useEffect, useMemo } from "react";

export interface StateData {
  state: string;
  districts: string[];
}

export function useLocation() {
  const [allData, setAllData] = useState<StateData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");

  // सिर्फ एक बार JSON लोड करें
  useEffect(() => {
    setLoading(true);
    fetch("/states-and-districts.json")
      .then((res) => res.json())
      .then((data) => {
        const statesArray = data.states || data;
        setAllData(statesArray);
      })
      .catch((err) => console.error("Error fetching location data:", err))
      .finally(() => setLoading(false));
  }, []);

  // useMemo से परफॉरमेंस फ़ास्ट होगी (ये बार-बार कैलकुलेट नहीं होगा)
  const states = useMemo(() => {
    return allData.map((item) => item.state);
  }, [allData]);

  const districts = useMemo(() => {
    const found = allData.find((item) => item.state === selectedState);
    return found?.districts || [];
  }, [selectedState, allData]);

  // जब State बदले, तो District को रीसेट करें
  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    setSelectedDistrict(""); 
  };

  return {
    states,
    districts,
    selectedState,
    selectedDistrict,
    handleStateChange,
    setSelectedDistrict,
    loading,
  };
}
