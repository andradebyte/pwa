import Compass from "@/components/Compass";
import LabShell from "@/components/labs/LabShell";

export default function CompassLab() {
  return (
    <LabShell title="Bússola" subtitle="DeviceOrientationEvent">
      <div className="-m-4">
        <Compass />
      </div>
    </LabShell>
  );
}
