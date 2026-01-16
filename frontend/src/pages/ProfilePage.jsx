import { useContext, useState } from 'react'
import assets from '../assets/assets.js'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext.jsx'

function ProfilePage() {

  const { authuser, updateProfile } = useContext(AuthContext)
  const [selectedImage, setSetselectedImage] = useState(null)
  const [name, setName] = useState(authuser.fullName)
  const [bio, setBio] = useState(authuser.bio)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedImage) {
      await updateProfile({ fullName: name, bio });
      navigate("/");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = async () => {
      const base64Image = reader.result;

      await updateProfile({
        profilePic: base64Image,
        fullName: name,
        bio,
      });

      navigate("/");
    };

    reader.readAsDataURL(selectedImage);
  };

  return (
    <div className='min-h-screen bg-cover bg-no-repeat flex items-center justify-center'>
      <div className="w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg">
        <form onSubmit={handleSubmit} className='flex flex-col gap-5 flex-1 p-10'>
          <h3 className='text-lg '>Profile details</h3>

          <label htmlFor="avatar" className='flex items-center gap-3 cursor-pointer'>

            <input onChange={(e) => setSetselectedImage(e.target.files[0])} type="file" id='avatar' accept='.png, .jpeg, .jpeg' hidden />
            <img src={selectedImage ? URL.createObjectURL(selectedImage) : assets.avatar_icon} className={`w-12 h-12 ${selectedImage && 'rounded-full'}`} alt="avatar" />
            upload profile image

          </label>

          <input onChange={(e) => setName(e.target.value)} value={name} type="text" placeholder="Amit Rawat" className='p-2 border border-gray-500 rounded-md focus:object-none focus:ring-2 outline-none focus:ring-violet-500' required />

          <textarea spellCheck="false" onChange={(e) => setBio(e.target.value)} value={bio} rows={4} required placeholder='write profile bio' className='p-2 outline-none border border-gray-500 rounded-md focus:object-none focus:ring-2 focus:ring-violet-500'></textarea>

          <button type='submit' className='bg-linear-to-r from-purple-400 to-violet-600 text-white p-2 rounded-full text-lg cursor-pointer'>Save</button>
        </form>
        <img src={authuser?.profilePic || assets.logo_icon} alt="logo" className={`max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10 ${selectedImage && 'rounded-full'}`} />
      </div>

    </div>
  )
}

export default ProfilePage