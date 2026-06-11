import DeviceInfo from "@/components/DeviceInfo";
import InstallButton from "@/components/InstallButton";

export default function DevicePage() {
  return (
    <>
      <div className="px-4 pt-4">
        <InstallButton />
      </div>
      <DeviceInfo />
    </>
  );
}
