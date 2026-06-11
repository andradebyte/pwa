import GpsTracker from "@/components/GpsTracker";
import LabShell from "@/components/labs/LabShell";

export default function GpsLab() {
  return (
    <LabShell title="GPS" subtitle="navigator.geolocation">
      <div className="-m-4">
        <GpsTracker />
      </div>
    </LabShell>
  );
}
