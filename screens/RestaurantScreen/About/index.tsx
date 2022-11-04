import Joi, { ObjectSchema } from 'joi'
import React from 'react'
import { Button, Card, Form, ListGroup, Stack } from 'react-bootstrap'
import {
	Dimensions,
	FlatList,
	Modal,
	Pressable,
	SafeAreaView,
	ScrollView,
	Text,
	View
} from 'react-native'
import styles from './style'

const AboutScreen = ({
	navigation,
	route
}: {
	navigation: any
	route: any
}): JSX.Element => {
	const exampleImage: string = require('../../../assets/example.jpeg')
	const [modalVisible, setModalVisible] = React.useState(false)
	const [date, setDate] = React.useState<Date>(new Date())
	const [hour, setHour] = React.useState<Date>(new Date())
	const [people, setPeople] = React.useState<number>()
	const restaurante: any = route.params
	const [pratos, setPratos] = React.useState<any[]>([])
	const [avaliacoes, setAvaliacoes] = React.useState<any[]>([])
	const [message, setMessage] = React.useState<string>('')
	const [uniqueValue, setUniqueValue] = React.useState(1)
	const [feedback, setFeedback] = React.useState<string>('')

	React.useEffect(() => {
		fetchPlates()
		fetchAvaliacoes()

		const focusHandler = navigation.addListener('focus', () => {
			console.log('Refreshed')
		})

		return focusHandler
	}, [navigation, uniqueValue])

	const forceRemount = (): void => {
		setUniqueValue(uniqueValue + 1)
	}

	const ModalRender = ({
		title,
		message
	}: {
		title: string
		message: string
	}) => {
		return (
			<Modal
				animationType='slide'
				transparent={true}
				visible={modalVisible}
				onRequestClose={() => {
					setModalVisible(!modalVisible)
				}}
			>
				<View style={styles.centeredView}>
					<View style={styles.modalView}>
						<Text style={styles.modalText}>{title}</Text>
						<Text style={styles.modalText}>{message}</Text>
						<Pressable
							style={[styles.button, styles.buttonClose]}
							onPress={() => setModalVisible(!modalVisible)}
						>
							<Text style={styles.textStyle}>Fechar</Text>
						</Pressable>
					</View>
				</View>
			</Modal>
		)
	}

	const schema: ObjectSchema<any> = Joi.object({
		date: Joi.date().required().min('now'),
		people: Joi.number().required().min(1).max(10).integer(),
		hour: Joi.date().required().min('now')
	})

	const fetchAvaliacoes = async () => {
		console.log('fetching avaliacoes')

		try {
			await fetch(
				`${global.getApiUrl()}/api/getAvaliacoesByRestaurante`,
				{
					method: 'POST',
					headers: {
						Accept: 'application/json',
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						idRestaurante: restaurante.idRestaurante
					})
				}
			)
				.then((response: Response): Promise<JSON> => response.json())
				.then((json: any): void => {
					json.forEach((element: any) => {
						avaliacoes.push(element)
					})

					console.log(avaliacoes)
				})
				.catch((error: Error): void => {
					console.error(error)
				})
		} catch (error: unknown) {
			console.log(error)
		}
	}

	const fetchPlates = async () => {
		try {
			await fetch(`${global.getApiUrl()}/api/getPratosByRestaurante`, {
				method: 'post',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					idRestaurante: restaurante.idRestaurante
				})
			})
				.then((response: any): Promise<JSON> => response.json())
				.then((json: any): void => {
					json.forEach((element: any) => {
						pratos.push(element)
					})

					console.log(pratos)
				})
				.catch((err: Error): void => console.error(err))
		} catch (error: unknown) {
			console.error(error)
		}
	}

	const renderCardapio = (item: any): JSX.Element => {
		return (
			<View style={styles.spaceCategory}>
				<img
					src={exampleImage}
					onClick={() => window.alert('AAAA')}
					className='rounded-circle'
					style={{
						width: 90,
						height: 90,
						marginLeft: 10,
						marginRight: 10
					}}
				/>
				<Text style={styles.nameCategory}>{item.item.nomePrato}</Text>
			</View>
		)
	}

	const renderAvaliacoes = (item: any): JSX.Element => {
		return (
			<View key={uniqueValue}>
				<Card
					style={{
						width: Dimensions.get('window').width * 0.9,
						border: 'none'
					}}
				>
					<Card.Body>
						<Card.Title>
							{item.item.nomeCliente} - {item.item.notaAvaliacao}
						</Card.Title>
						<Card.Subtitle className='mb-2 text-muted'>
							{item.item.dtAvaliacao}
						</Card.Subtitle>
						<Card.Text>{item.item.descAvaliacao}</Card.Text>
					</Card.Body>
				</Card>
			</View>
		)
	}

	const bearerTokenTest: React.FormEventHandler<HTMLFormElement> = async (
		event: React.FormEvent<HTMLFormElement>
	): Promise<void> => {
		event.preventDefault()

		try {
			await fetch(`${global.API_URL}/api/reserva`, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${global.getToken()}`
				},
				body: JSON.stringify({
					idCliente: global.user.id
				})
			})
				.then((response) => response.json())
				.then((json) => {
					console.log(json)
				})
				.catch((error) => {
					console.error(error)
				})
				.finally(() => {
					setDate(new Date())
					setHour(new Date())
					setPeople(0)
				})
		} catch (error) {
			console.log(error)
		}
	}

	const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (
		event: React.FormEvent<HTMLFormElement>
	) => {
		event.preventDefault()

		const packets = {
			date: date,
			hour: hour,
			people: people
		}

		if (schema.validate(packets)) {
			try {
				await fetch(`${global.getApiUrl()}/api/reserva`, {
					method: 'POST',
					headers: {
						Accept: 'application/json',
						'Content-Type': 'application/json',
						Authorization: `Bearer ${global.getToken()}`
					},
					body: JSON.stringify({
						dataReserva: date.toString(),
						horaReserva: hour.toString() + ':00',
						numPessoas: people,
						idCliente: global.user.id,
						idRestaurante: restaurante.idRestaurante,
						idStatusReserva: 1
					})
				})
					.then((response) => response.json())
					.then((json) => {
						console.log(json)

						if (json.status === 200) {
							window.alert(json.message)
						} else {
							window.alert(json.message)
						}
					})
					.catch((error) => {
						console.error(error)
					})
			} catch (error) {
				console.log(error)
			}
		}
	}

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.tecoVermeio}></View>
			<ScrollView
				style={{ marginLeft: '-10%' }}
				showsVerticalScrollIndicator={false}
			>
				<View
					style={{
						flex: 1,
						alignItems: 'flex-start',
						justifyContent: 'flex-start',
						marginTop: '5%'
					}}
				>
					<Stack
						direction='horizontal'
						gap={2}
						style={{ marginLeft: 96 }}
					>
						<div style={styles.PositionImgRestaurant}>
							<img
								src={exampleImage}
								className='rounded-circle'
								style={{
									width: 100,
									height: 100,
									marginLeft: 25,
									marginRight: 10
								}}
							/>
						</div>
						<div>
							<Text style={styles.subtitle}>
								{restaurante.nomeRestaurante}
							</Text>
							<br />
							<Text style={styles.description}>
								Classificação:{' '}
								{Number.parseFloat(restaurante.notaAvaliacao)}
								<br />
							</Text>
							<Text style={styles.description}>
								Tipo De Culinaria: {restaurante.tipoRestaurante}
							</Text>
						</div>
					</Stack>
				</View>

				<View
					style={{
						flex: 1,
						alignItems: 'flex-start',
						justifyContent: 'flex-start',
						marginHorizontal: '10%',
						marginBottom: '5%',
						marginTop: '-15.5%'
					}}
				>
					<Text style={styles.subtitle}>Descrição</Text>

					<Text
						style={[
							styles.description,
							{
								textAlign: 'justify',
								marginTop: '5%'
							}
						]}
					>
						{restaurante.descricaoRestaurante}
					</Text>
				</View>

				<View
					style={{
						flex: 1,
						alignItems: 'flex-start',
						justifyContent: 'flex-start',
						marginHorizontal: '10%',
						marginTop: '6.5%'
					}}
				>
					<Text style={styles.subtitle}>Contato</Text>
					<Text
						style={[
							styles.description,
							{
								textAlign: 'justify',
								marginTop: '5%'
							}
						]}
					>
						Telefone: {restaurante.telRestaurante}
					</Text>
					<Text
						style={[
							styles.description,
							{
								textAlign: 'justify',
								marginTop: '5%'
							}
						]}
					>
						Email: {restaurante.emailRestaurante}
					</Text>
					<Text
						style={[
							styles.description,
							{
								textAlign: 'justify',
								marginTop: '5%'
							}
						]}
					>
						Endereço: {restaurante.ruaRestaurante} -{' '}
						{restaurante.bairroRestaurante}
					</Text>
					<Text
						style={[
							styles.description,
							{
								textAlign: 'justify',
								marginTop: '5%'
							}
						]}
					>
						Cidade: {restaurante.cidadeRestaurante} /{' '}
						{restaurante.estadoRestaurante}
					</Text>
				</View>

				<View
					style={{
						flex: 1,
						alignItems: 'flex-start',
						justifyContent: 'flex-start',
						marginHorizontal: '10%',
						marginTop: '-5%'
					}}
				>
					<Text style={styles.subtitle}>Horários do restaurante</Text>

					<Text
						style={[
							styles.description,
							{
								textAlign: 'justify',
								marginTop: '3.5%'
							}
						]}
					>
						Segunda-feira: {restaurante.horarioAberturaRestaurante}{' '}
						- {restaurante.horarioFechamentoRestaurante}
						<br />
						<br />
						Terça-feira: {
							restaurante.horarioAberturaRestaurante
						} - {restaurante.horarioFechamentoRestaurante}
						<br />
						<br />
						Quarta-feira: {
							restaurante.horarioAberturaRestaurante
						} - {restaurante.horarioFechamentoRestaurante}
						<br />
						<br />
						Quinta-feira: {
							restaurante.horarioAberturaRestaurante
						} - {restaurante.horarioFechamentoRestaurante}
						<br />
						<br />
						Sexta-feira: {
							restaurante.horarioAberturaRestaurante
						} - {restaurante.horarioFechamentoRestaurante}
						<br />
						<br />
						Sábado: {restaurante.horarioAberturaRestaurante} -{' '}
						{restaurante.horarioFechamentoRestaurante}
						<br />
						<br />
						Domingo: {restaurante.horarioAberturaRestaurante} -{' '}
						{restaurante.horarioFechamentoRestaurante}
					</Text>
				</View>

				<View style={styles.rowList}>
					<Text style={styles.subtitle}>Cardápio</Text>
					<View
						style={{
							marginLeft: '6%',
							marginTop: '2.5%'
						}}
					>
						<ListGroup>
							<FlatList
								data={pratos}
								horizontal={true}
								showsHorizontalScrollIndicator={false}
								scrollEnabled={true}
								keyExtractor={(item: any) => item.idPrato}
								renderItem={renderCardapio}
							/>
						</ListGroup>
					</View>
				</View>

				<View
					style={[
						styles.rowList,
						{
							marginBottom: '10%',
							marginTop: '-20%'
						}
					]}
				>
					<Text style={styles.subtitle}>Avaliações</Text>

					<FlatList
						data={avaliacoes}
						showsVerticalScrollIndicator={false}
						renderItem={renderAvaliacoes}
						keyExtractor={(item): any => item.idAvaliacao}
					/>
				</View>

				<View
					style={{
						flex: 1,
						alignItems: 'flex-start',
						justifyContent: 'flex-start',
						marginHorizontal: '10%',
						marginTop: '-2.5%'
					}}
				>
					<View
						style={{
							flex: 1,
							alignItems: 'flex-start',
							justifyContent: 'flex-start'
						}}
					>
						<Text
							style={[
								styles.subtitle,
								{
									textAlign: 'justify'
								}
							]}
						>
							Agendar reserva
						</Text>

						<Form onSubmit={handleSubmit} style={styles.formsStyle}>
							<Form.Group controlId='formBasicDate'>
								<Form.Label>Data</Form.Label>
								<Form.Control
									type='date'
									placeholder='Data da reserva'
									onChange={(e: any) =>
										setDate(e.target.value)
									}
									style={{
										width:
											Dimensions.get('window').width *
											0.75
									}}
								/>
							</Form.Group>

							<Form.Group controlId='formBasicHour'>
								<Form.Label>Hora</Form.Label>
								<Form.Control
									type='time'
									placeholder='Hora da reserva'
									onChange={(e: any) =>
										setHour(e.target.value)
									}
								/>
							</Form.Group>

							<Form.Group controlId='formBasicPeople'>
								<Form.Label>Pessoas</Form.Label>
								<Form.Control
									type='number'
									placeholder='Número de pessoas'
									onChange={(e: any) =>
										setPeople(
											Number.parseInt(e.target.value)
										)
									}
								/>
							</Form.Group>

							<Form.Group
								style={{
									display: 'flex',
									justifyContent: 'center',
									alignItems: 'center',
									marginTop: 20
								}}
								controlId='formBasicSubmit'
							>
								<Button
									variant='danger'
									type='submit'
									style={styles.button}
								>
									<Text style={{ color: '#fff' }}>
										Reservar
									</Text>
								</Button>
							</Form.Group>

							<View
								style={{
									marginVertical: '5%'
								}}
							>
								<Form.Group
									className='mb-3'
									controlId='formBasicFeedback'
								>
									<Text
										style={{
											color: '#963333',
											fontSize: 16,
											fontWeight: 'bold'
										}}
									>
										{message}
									</Text>
								</Form.Group>
							</View>
						</Form>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	)
}

export default AboutScreen
