export default function ProfileLoading() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#f2f2f7]">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-600" />
        <p className="mt-4 text-[14px] text-gray-500">Loading profile...</p>
      </div>
    </div>
  );
}
