/**
 * @jest-environment jsdom
 */

import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"


import {screen, waitFor} from "@testing-library/dom"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import { fireEvent } from "@testing-library/dom";
import mockStore from "../__mocks__/store"
import router from "../app/Router.js";



describe("Given I am connected as an employee", () => {

  describe("When I am on NewBill Page", () => {

    test("Then mail icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const mailIcon = screen.getByTestId('icon-mail')
       expect(mailIcon.className).toBe('active-icon')
    })
  })

  describe("When I click add file button", () => {
    test("Then I should be navigated to choose a file", () => {
      document.body.innerHTML = NewBillUI();
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      document.body.innerHTML = NewBillUI({data : [bills[0]]})
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      // add file button
      const addFileBtn = screen.getByTestId("file")
      const testNewbill = new NewBill({document, onNavigate, localStorage: window.localStorage, store: null})
      // click event of file button
      const handleChangeFile = jest.fn(() => { testNewbill.handleChangeFile }) 
      addFileBtn.addEventListener('click', handleChangeFile)
      fireEvent.click(addFileBtn)
      expect(handleChangeFile).toHaveBeenCalled()
    })
  })    
  describe("When I choose a file with incorrect form of extension of file to upload", () => {
    test("It shouldn't be uploaded", async () => {

      document.body.innerHTML = NewBillUI();
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))
      document.body.innerHTML = NewBillUI({data : [bills[0]]})
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const testNewbill = new NewBill({document, onNavigate, localStorage: window.localStorage, store: mockStore})

      // create file to upload
      const badFile = new File(["image"], "file.pdf", {type: "image/gif"})

      const resultUpload = await testNewbill.uploadFile(badFile)

      expect(resultUpload).toBeFalsy()

      // expect(window.alert).toHaveBeenCalledWith('Seuls les fichiers .jpg, .jpeg et .png sont acceptés')

    })
  })
  describe("When I fill up the forms correctly and click submit button", () => {
    test("It should make a new bill", async () => {
      // codes
      document.body.innerHTML = NewBillUI();
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      // instance of NewBill
      const testNewbill = new NewBill({document, onNavigate, localStorage: window.localStorage, store: mockStore})
      // submit button
      const submitBtn = screen.getByTestId("form-new-bill")
      const newFile = new File(["image"], "file.jpeg", {type: "image/jpeg"})
      const resultUpload = await testNewbill.uploadFile(newFile)
      expect(resultUpload).toBeTruthy()

      // mock data
      const inputData = {
        id: "47qAXb6fIm2zOKkLzMro",
        vat: "80",
        fileUrl: "public\\4b392f446047ced066990b0627cfa444",
        status: "pending",
        type: "Hôtel et logement",
        commentary: "séminaire billed",
        name: "encore",
        fileName: "file.jpg",
        date: "2004-04-04",
        amount: 400,
        commentAdmin: "ok",
        pct: 20
      }

      screen.getByTestId("expense-type").value = inputData.type
      screen.getByTestId("expense-name").value = inputData.name
      screen.getByTestId("amount").value = inputData.amount
      screen.getByTestId("datepicker").value = inputData.date
      screen.getByTestId("vat").value = inputData.vat
      screen.getByTestId("pct").value = inputData.pct
      screen.getByTestId("commentary").value = inputData.commentary
      testNewbill.fileName = inputData.fileName
      testNewbill.fileUrl = inputData.fileUrl
      testNewbill.updateBill = jest.fn()
      const handleSubmit = jest.fn((e)=>{ testNewbill.handleSubmit(e)})
      submitBtn.addEventListener("submit", handleSubmit)
      fireEvent.submit(submitBtn)
      expect(handleSubmit).toHaveBeenCalled()
      expect(testNewbill.updateBill).toHaveBeenCalled()
    })
  })
})

// TEST API response

describe("When I am on NewBill Page and submit the form", () => {
  beforeEach(() => {
    jest.spyOn(mockStore, "bills")
    Object.defineProperty(
      window,
      'localStorage',
      { value: localStorageMock }
    )
    window.localStorage.setItem('user', JSON.stringify({
      type: 'Employee',
      email: "a@a"
    }))
    const root = document.createElement("div")
    root.setAttribute("id", "root")
    document.body.appendChild(root)
    router()
  })
  describe("When API is OK", () => {
    test("Then it should call updatebills function", async () => {
      const newBill = new NewBill({
        document, onNavigate, store: mockStore, localeStorage: localStorageMock
      })
      const handleSubmit = jest.fn(newBill.handleSubmit)
      const form = screen.getByTestId("form-new-bill")
      form.addEventListener("submit", handleSubmit)
      fireEvent.submit(form)
      expect(mockStore.bills).toHaveBeenCalled()
    })
  })
  describe("When API fail", () => {
    test("Then it should display an error", async () => {
      window.onNavigate(ROUTES_PATH.NewBill)
      mockStore.bills.mockImplementationOnce(() => {
        return {
          update: () => {
            return Promise.reject(new Error("Erreur"))
          }
        }
      })
      const newBill = new NewBill({
        document, onNavigate, store: mockStore, localeStorage: localStorageMock
      })
      const handleSubmit = jest.fn(newBill.handleSubmit)
      const form = screen.getByTestId("form-new-bill")
      form.addEventListener("submit", handleSubmit)
      fireEvent.submit(form)
      setTimeout(() => {
        expect(getByTestId(document.body, "error").classList).not.toContain("hidden")
      }, 1000)
    })
  })
})