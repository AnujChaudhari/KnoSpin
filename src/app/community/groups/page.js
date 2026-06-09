// app/community/groups/create/page.tsx
"use client";

import { useState, useEffect } from "react";

export default function CreateGroupPage() {
  const [states, setStates] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  useEffect(() => {
    fetch("/states-and-districts.json")
      .then(res => res.json())
      .then(data => {
        const statesArray = data.states || data;
        setStates(statesArray.map((item: any) => item.state));
      })
      .catch(err => console.error(err));
  }, []);

  const handleStateChange = (state: string) => {
    setSelectedState(state);
    fetch("/states-and-districts.json")
      .then(res => res.json())
      .then(data => {
        const statesArray = data.states || data;
        const found = statesArray.find((item: any) => item.state === state);
        setDistricts(found?.districts || []);
      });
    setSelectedDistrict("");
  };

  return (
    <div className="p-4">
      <select onChange={(e) => handleStateChange(e.target.value)} className="p-2 border rounded">
        <option value="">Select State</option>
        {states.map(state => <option key={state}>{state}</option>)}
      </select>

      <select 
        disabled={!selectedState} 
        onChange={(e) => setSelectedDistrict(e.target.value)}
        className="p-2 border rounded ml-2"
      >
        <option value="">Select District</option>
        {districts.map(district => <option key={district}>{district}</option>)}
      </select>
    </div>
  );
}
