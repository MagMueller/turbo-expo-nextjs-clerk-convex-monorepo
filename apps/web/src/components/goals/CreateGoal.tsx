"use client";

import { Dialog, Transition } from "@headlessui/react";
import { api } from "@packages/backend/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import Image from "next/image";
import { Fragment, useRef, useState } from "react";

export default function CreateGoal() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [verifierId, setVerifierId] = useState("");
  const [newGoalDeadline, setNewGoalDeadline] = useState("");
  const [verifierSearch, setVerifierSearch] = useState("");
  const [isVerifierSelectOpen, setIsVerifierSelectOpen] = useState(false);

  const cancelButtonRef = useRef(null);

  const createGoal = useMutation(api.goals.createGoal);
  const openaiKeySet = useQuery(api.openai.openaiKeySet) ?? true;
  const friends = useQuery(api.friends.getFriends);

  const filteredFriends = friends?.filter(friend => 
    friend.friendName.toLowerCase().includes(verifierSearch.toLowerCase()) ||
    friend.friendEmail.toLowerCase().includes(verifierSearch.toLowerCase())
  );

  const createUserGoal = async () => {
    await createGoal({
      title,
      content,
      isSummary: isChecked,
      deadline: newGoalDeadline || undefined,
      verifierId: verifierId || undefined,
    });
    setOpen(false);
  };

  const handleVerifierSelectToggle = () => {
    setIsVerifierSelectOpen(!isVerifierSelectOpen);
  };

  return (
    <>
      <div className="flex justify-center items-center">
        <button
          onClick={() => setOpen(true)}
          className="button text-[#EBECEF] flex gap-4 justify-center items-center text-center px-8 sm:px-16 py-2"
        >
          <Image
            src={"/images/Add.png"}
            width={40}
            height={40}
            alt="search"
            className="float-right sm:w-[40px] sm:h-[40px] w-6 h-6"
          />
          <span className="text-[17px] sm:text-3xl not-italic font-medium leading-[79%] tracking-[-0.75px]">
            {" "}
            New Goal
          </span>
        </button>
      </div>

      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          initialFocus={cancelButtonRef}
          onClose={setOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <form className="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-2 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                  <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                        <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                          Create New Goal
                        </Dialog.Title>
                        <div className="mt-2">
                          <input
                            type="text"
                            placeholder="Goal Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full p-2 border rounded"
                          />
                          <textarea
                            placeholder="Goal Description"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full p-2 border rounded mt-2"
                          />
                          <div className="mt-2">
                            <label className="inline-flex items-center">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => setIsChecked(e.target.checked)}
                                className="form-checkbox"
                              />
                              <span className="ml-2">Generate Summary</span>
                            </label>
                          </div>
                          <div className="mt-2">
                            <input
                              type="date"
                              value={newGoalDeadline}
                              onChange={(e) => setNewGoalDeadline(e.target.value)}
                              className="w-full p-2 border rounded"
                            />
                          </div>
                          <div className="mt-2 relative">
                            <button
                              type="button"
                              onClick={handleVerifierSelectToggle}
                              className="w-full p-2 border rounded text-left"
                            >
                              {verifierId ? "Change Verifier" : "Set Verifier"}
                            </button>
                            {isVerifierSelectOpen && (
                              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                                <input
                                  type="text"
                                  placeholder="Search friends"
                                  value={verifierSearch}
                                  onChange={(e) => setVerifierSearch(e.target.value)}
                                  className="w-full p-2 border-b border-gray-300"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <ul className="max-h-40 overflow-y-auto">
                                  {filteredFriends?.map((friend) => (
                                    <li
                                      key={friend.friendId}
                                      className="p-2 hover:bg-gray-100 cursor-pointer"
                                      onClick={() => {
                                        setVerifierId(friend.friendId);
                                        setIsVerifierSelectOpen(false);
                                      }}
                                    >
                                      {friend.friendName} ({friend.friendEmail})
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                      onClick={createUserGoal}
                    >
                      Create
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={() => setOpen(false)}
                      ref={cancelButtonRef}
                    >
                      Cancel
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </form>
        </Dialog>
      </Transition.Root>
    </>
  );
}