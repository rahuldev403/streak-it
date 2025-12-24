import Enrolledcourses from "@/app/_components/Enrolledcourses";
import Welcomebanner from "@/app/_components/Welcomebanner";

const page = () => {
  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Welcomebanner />
            <Enrolledcourses />
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Sidebar</h3>
            {/* Add sidebar content here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
