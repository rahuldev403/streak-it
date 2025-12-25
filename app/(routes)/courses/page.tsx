import Image from "next/image";
import banner from "@/public/bg.gif";
import CourseList from "@/app/_components/CourseList";
const page = () => {
  return (
    <div>
      <div className="relative flex justify-center rounded-md border-4 border-gray-800 overflow-hidden mt-3 w-[80%] mx-auto box-shadow-lg ">
        <Image
          src={banner}
          alt="banner"
          priority
          className="border-4 border-gray-800 overflow-hidden w-[80%] max-w-4xl h-auto"
        />
      </div>
      <div className="absolute top-0 left-0 w-full h-full flex flex-col justify-center items-center ">
        <h1 className="text-5xl font-game font-bold text-gray-400  ml-10">
          Explore Our Courses
        </h1>
        <p className="text-lg font-game text-white ml-10">
          Dive into a variety of courses designed to enhance your skills and
          knowledge.
        </p>
      </div>
      <div>
        <CourseList />
      </div>
    </div>
  );
};

export default page;
