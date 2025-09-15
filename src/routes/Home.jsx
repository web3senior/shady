import { useState, useRef, useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'
import Metadata from '../assets/metadata.json'
import { useUpProvider } from '../contexts/UpProvider'
import { PinataSDK } from 'pinata'
import ABI from '../abi/Shady.json'
import Web3 from 'web3'
import styles from './Home.module.scss'

const pinata = new PinataSDK({
  pinataJwt: import.meta.env.VITE_PINATA_API_KEY,
  pinataGateway: 'https://gateway.pinata.cloud/ipfs/',
})

function Home() {
  const [totalSupply, setTotalSupply] = useState(0)
  const [maxSupply, setMaxSupply] = useState(0)
  const [mintPrice, setMintPrice] = useState(1)
  const [showMessage, setShowMessage] = useState(false)
  const auth = useUpProvider()

  const web3Readonly = new Web3(import.meta.env.VITE_LUKSO_PROVIDER)
  const _ = web3Readonly.utils
  const contractReadonly = new web3Readonly.eth.Contract(ABI, import.meta.env.VITE_CONTRACT)

  const GATEWAY = `https://ipfs.io/ipfs/`
  const CID = `bafybeihqjtxnlkqwykthnj7idx6ytivmyttjcm4ckuljlkkauh6nm3lzve`
  const BASE_URL = `./shady-dj/` //`https://aratta.dev/dracos-nfts/` //`${GATEWAY}${CID}/` // `http://localhost/luxgenerator/src/assets/pepito-pfp/` //`http://localhost/luxgenerator/src/assets/pepito-pfp/` //`${GATEWAY}${CID}/` // Or

  const weightedRandom = (items) => {
    //console.log(items)
    const totalWeight = items.reduce((acc, item) => acc + item.weight, 0)
    const randomNum = Math.random() * totalWeight

    let weightSum = 0
    for (const item of items) {
      weightSum += item.weight
      if (randomNum <= weightSum) {
        //        console.log(item.name)
        return item.name
      }
    }
  }

  const download = (url) => {
    //const htmlStr = SVG.current.outerHTML
    // const blob = new Blob([htmlStr], { type: 'image/svg+xml' })
    // const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
    //  return
    //   const a = document.createElement('a')
    // a.setAttribute('download')

    //   a.setAttribute('href', url)
    //   a.style.display = 'none'
    //   document.body.appendChild(a)
    //   a.click()
    //   a.remove()
    // URL.revokeObjectURL(url)
  }

  const generate = async (trait) => {
    const svgns = 'http://www.w3.org/2000/svg'
    const gRef = document.createElementNS(svgns, 'g')

    // Clear the board
    // SVG.current.innerHTML = ''
    const randomTrait = weightedRandom(Metadata[`${trait}`])
    //    console.log(`${BASE_URL}${trait}/${randomTrait}.png`)
    let response = await fetch(`${BASE_URL}${trait}/${randomTrait}.png`, { mode: 'no-cors' })
    let blob = await response.blob()

    const reader = new FileReader()
    reader.readAsDataURL(blob)
    reader.onloadend = () => {
      const base64data = reader.result

      const image = document.createElementNS(svgns, 'image')
      image.setAttribute('href', base64data)
      image.setAttribute('width', 400)
      image.setAttribute('height', 400)
      image.setAttribute('x', 0)
      image.setAttribute('y', 0)
      //      image.addEventListener('load', () => console.log(`${trait} has been loaded`))

      // Add to the group
      switch (trait) {
        case `background`:
          gRef.appendChild(image)
          break
        case `body`:
          gRef.appendChild(image)
          break
        case `head`:
          gRef.appendChild(image)
          break
        case `bonus2`:
          gRef.appendChild(image)
          break
        case `bonus1`:
          gRef.appendChild(image)
          break
        case `weapon`:
          gRef.appendChild(image)
          break
        case `shield`:
          gRef.appendChild(image)
          break
        default:
          break
      }
    }

    await sleep(1000)
    return [randomTrait, gRef]
  }

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

  const rAsset = async (cid) => {
    const assetBuffer = await fetch(`${cid}`, {
      mode: 'cors',
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    }).then(async (response) => {
      return response.arrayBuffer().then((buffer) => new Uint8Array(buffer))
    })

    return assetBuffer
  }

  const upload = async (htmlStr) => {
    // const htmlStr = document.querySelector(`.${styles['board']} svg`).outerHTML
    const blob = new Blob([htmlStr], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)

    try {
      const t = toast.loading(`working on it...`, { icon: `⚒️` })
      const file = new File([blob], 'pfp.svg', { type: blob.type })
      const upload = await pinata.upload.file(file)
      // console.log(upload)
      toast.dismiss(t)
      console.log()
      return [upload.IpfsHash, url]
    } catch (error) {
      console.log(error)
    }
  }

  const getTotalSupply = async () => await contractReadonly.methods.totalSupply().call()
  const getMaxSupply = async () => await contractReadonly.methods.MAXSUPPLY().call()

  const mint = async (e) => {
    if (!auth.walletConnected) {
      toast.error(`Connect your wallet`, { icon: `🤬` })
      return
    }
    e.target.disabled = true
    const web3 = new Web3(auth.provider)
    const contract = new web3.eth.Contract(ABI, import.meta.env.VITE_CONTRACT)

    const createToast = toast.loading(`please wait.....`)

    // Create the SVG
    const svgns = 'http://www.w3.org/2000/svg'

    var svg = document.createElementNS(svgns, 'svg')
    svg.setAttribute('viewbox', '0 0 400 400')
    svg.setAttribute('xmlns', svgns)
    svg.setAttribute('width', '400px')
    svg.setAttribute('height', '400px')

    const background = await generate(`background`)
    const body = await generate(`body`)
    const head = await generate(`head`)
    const bonus2 = await generate(`bonus2`)
    const bonus1 = await generate(`bonus1`)
    const weapon = await generate(`weapon`)
    const shield = await generate(`shield`)

    svg.appendChild(background[1])
    svg.appendChild(body[1])
    svg.appendChild(head[1])
    svg.appendChild(bonus2[1])
    svg.appendChild(bonus1[1])
    svg.appendChild(weapon[1])
    svg.appendChild(shield[1])

    // document.body.appendChild(svg)

    let attributes = []
    if (background[0].toUpperCase() !== `NONE`) attributes.push({ key: 'Background', value: background[0].toUpperCase() })
    if (body[0].toUpperCase() !== `NONE`) attributes.push({ key: 'Body', value: body[0].toUpperCase() })
    if (head[0].toUpperCase() !== `NONE`) attributes.push({ key: 'Head', value: head[0].toUpperCase() })
    if (bonus2[0].toUpperCase() !== `NONE`) attributes.push({ key: 'Bonus2', value: bonus2[0].toUpperCase() })
    if (bonus1[0].toUpperCase() !== `NONE`) attributes.push({ key: 'Bonus1', value: bonus1[0].toUpperCase() })
    if (weapon[0].toUpperCase() !== `NONE`) attributes.push({ key: 'Weapon', value: weapon[0].toUpperCase() })
    if (shield[0].toUpperCase() !== `NONE`) attributes.push({ key: 'Shield', value: shield[0].toUpperCase() })

    const uploadResult = await upload(svg.outerHTML)
    console.log(`uploadResult => `, uploadResult)
    const verifiableUrl = await rAsset(uploadResult[1]) //uploadResult[1]

    toast.dismiss(createToast)
    const t = toast.loading(`please confirm the transaction`)

    const metadata = JSON.stringify({
      LSP4Metadata: {
        name: 'Shady',
        description: `a collection of 3333 shady dj's. pure art and satire.`,
        links: [],
        attributes: attributes,
        icon: [
          {
            width: 512,
            height: 512,
            url: 'ipfs://bafybeica7kbzyn2z3dx5gook7vymd54gwxdhgzdljo4iihzcupa7etrgey',
            verification: {
              method: 'keccak256(bytes)',
              data: '0x0e472330e634d9ae6654b112c9b67a2a3c0bc6e3591079a752b85392b14cbdd9',
            },
          },
        ],
        backgroundImage: [],
        assets: [],
        images: [
          [
            {
              width: 1000,
              height: 1000,
              url: `ipfs://${uploadResult[0]}`,
              verification: {
                method: 'keccak256(bytes)',
                data: _.keccak256(verifiableUrl),
              },
            },
          ],
        ],
      },
    })

    try {
      contract.methods
        .mintShady(metadata)
        .send({
          from: auth.accounts[0],
          value: web3.utils.toWei(mintPrice, `ether`),
        })
        .then((res) => {
          console.log(res)

          toast.success(`Done`)
          toast.dismiss(t)
          e.target.disabled = false

          setShowMessage(true)

          getTotalSupply().then((res) => {
            console.log(res)
            setTotalSupply(_.toNumber(res))
          })

          getMaxSupply().then((res) => {
            console.log(res)
            setMaxSupply(_.toNumber(res))
          })
        })
        .catch((error) => {
          console.log(error)
          toast.dismiss(t)
        })
    } catch (error) {
      console.log(error)
      toast.dismiss(t)
    }
  }

  useEffect(() => {
    console.clear()

    getTotalSupply().then((res) => {
      console.log(res)
      setTotalSupply(_.toNumber(res))
    })

    getMaxSupply().then((res) => {
      console.log(res)
      setMaxSupply(_.toNumber(res))
    })
  }, [])

  return (
    <>
      <div className={`${styles.page} __container`} data-width={`medium`}>
        <Toaster />
        <main className={`${styles.main} d-f-c`}>
          <ul className={`d-flex flex-row justify-content-between grid--gap-1`}>
            <li className={`d-flex flex-column`}>
              <b>
                Max Supply {maxSupply - totalSupply} - {maxSupply}
              </b>
            </li>
            <li className={`d-flex flex-column`}>
              <b className={`d-f-c grid--gap-025`}>Price 1 LYX</b>
            </li>
            <li>
              <button onClick={(e) => mint(e)} className={`d-f-c`}>
                Mint
              </button>
            </li>
          </ul>

          {showMessage && <h3>fuck you</h3>}
        </main>

        {/* <div className={`${styles['board']} d-f-c card`}>
          <svg ref={SVG} viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
            <g ref={backgroundGroupRef} name={`backgroundGroup`} />
            <g ref={backGroupRef} name={`backGroup`} />
            <g ref={baseGroupRef} name={`baseGroup`} />
            <g ref={clothingGroupRef} name={`clothingGroup`} />
            <g ref={eyesGroupRef} name={`eyesGroup`} />
            <g ref={mouthGroupRef} name={`mouthGroup`} />
            <g ref={headGroupRef} name={`headGroup`} />
          </svg>
        </div> */}
      </div>
    </>
  )
}
export default Home
