import VibrationTester from "@/components/VibrationTester";
import LabShell from "@/components/labs/LabShell";

export default function VibrationLab() {
  return (
    <LabShell title="Vibração" subtitle="navigator.vibrate">
      <div className="-m-4">
        <VibrationTester />
      </div>
    </LabShell>
  );
}
